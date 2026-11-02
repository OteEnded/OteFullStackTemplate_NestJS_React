import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  INestApplication,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsIn, IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { configureApp } from '../../app.setup';

class ProbeDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(['draft', 'active'])
  status!: string;
}

/** Every route throws one kind of error, so each error path can be checked. */
@Controller('probe')
class ProbeController {
  @Get('ok')
  ok() {
    return { hello: 'world' };
  }

  @Post('validate')
  validate(@Body() dto: ProbeDto) {
    return dto;
  }

  @Get('not-found')
  notFound() {
    throw new NotFoundException('item not found');
  }

  @Get('unauthorized')
  unauthorized() {
    throw new UnauthorizedException('missing bearer token');
  }

  @Get('forbidden')
  forbidden() {
    throw new ForbiddenException();
  }

  @Get('conflict')
  conflict() {
    throw new ConflictException('username already taken');
  }

  @Get('own-code')
  ownCode() {
    throw new HttpException(
      { message: 'Quota used up', code: 'quota_exceeded' },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  @Get('crash')
  crash() {
    // What a DB driver error looks like: SQL + internals in the message.
    throw new Error('relation "secret_table" does not exist: SELECT * FROM secret_table');
  }

  @Get('exposed-503')
  exposed503() {
    throw new HttpException(
      { message: 'Database unreachable', code: 'db_down', data: { status: 'error' } },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  @Get('http-500')
  http500() {
    throw new HttpException('pool exhausted at db.internal:5432', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

describe('Error envelope { ok: false, message, code }', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProbeController],
    }).compile();
    app = configureApp(moduleRef.createNestApplication({ logger: false }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  const http = () => request(app.getHttpServer());

  it('success stays { ok: true, data }', async () => {
    const res = await http().get('/api/probe/ok').expect(200);
    expect(res.body).toEqual({ ok: true, data: { hello: 'world' } });
  });

  it('validation error -> 400 invalid_request with field details', async () => {
    const res = await http()
      .post('/api/probe/validate')
      .send({ name: 'x', status: 'nope' })
      .expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe('invalid_request');
    expect(typeof res.body.message).toBe('string');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: expect.any(String) }),
        expect.objectContaining({ field: 'status', message: expect.any(String) }),
      ]),
    );
  });

  it('malformed JSON body -> 400 invalid_request', async () => {
    const res = await http()
      .post('/api/probe/validate')
      .set('Content-Type', 'application/json')
      .send('{"name": ')
      .expect(400);
    expect(res.body).toMatchObject({ ok: false, code: 'invalid_request' });
  });

  it('NotFoundException -> 404 not_found', async () => {
    const res = await http().get('/api/probe/not-found').expect(404);
    expect(res.body).toEqual({ ok: false, message: 'item not found', code: 'not_found' });
  });

  it('unknown route -> 404 not_found', async () => {
    const res = await http().get('/api/no-such-route').expect(404);
    expect(res.body).toMatchObject({ ok: false, code: 'not_found' });
  });

  it('401 -> not_signed_in', async () => {
    const res = await http().get('/api/probe/unauthorized').expect(401);
    expect(res.body).toEqual({ ok: false, message: 'missing bearer token', code: 'not_signed_in' });
  });

  it('403 -> forbidden', async () => {
    const res = await http().get('/api/probe/forbidden').expect(403);
    expect(res.body).toMatchObject({ ok: false, code: 'forbidden' });
  });

  it('409 -> conflict', async () => {
    const res = await http().get('/api/probe/conflict').expect(409);
    expect(res.body).toEqual({ ok: false, message: 'username already taken', code: 'conflict' });
  });

  it('an HttpException whose response carries `code` keeps its own code', async () => {
    const res = await http().get('/api/probe/own-code').expect(429);
    expect(res.body).toEqual({ ok: false, message: 'Quota used up', code: 'quota_exceeded' });
  });

  it('unexpected Error -> 500 internal_error, generic message, request_id, no internals', async () => {
    const res = await http().get('/api/probe/crash').expect(500);
    expect(res.body).toEqual({
      ok: false,
      message: 'Internal server error',
      code: 'internal_error',
      request_id: expect.any(String),
    });
    expect(res.body.request_id.length).toBeGreaterThan(0);
    const raw = JSON.stringify(res.body);
    expect(raw).not.toMatch(/secret_table|SELECT|stack|at /);
  });

  it('a plain 5xx HttpException is also hidden behind the generic message', async () => {
    const res = await http().get('/api/probe/http-500').expect(500);
    expect(res.body).toMatchObject({ ok: false, message: 'Internal server error', code: 'internal_error' });
    expect(JSON.stringify(res.body)).not.toMatch(/db\.internal/);
  });

  it('a 5xx HttpException carrying its own `code` is client-safe: keeps message, code, data', async () => {
    const res = await http().get('/api/probe/exposed-503').expect(503);
    expect(res.body).toEqual({
      ok: false,
      message: 'Database unreachable',
      code: 'db_down',
      request_id: expect.any(String),
      data: { status: 'error' },
    });
  });

  it('never sends the old statusCode field (status is the HTTP status)', async () => {
    const res = await http().get('/api/probe/not-found').expect(404);
    expect(res.body.statusCode).toBeUndefined();
  });
});
