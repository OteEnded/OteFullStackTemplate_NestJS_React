import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * End-to-end test: boots the real AppModule (Express + TypeORM) and drives it
 * over HTTP with supertest.
 *
 * REQUIRES a running, migrated PostgreSQL (the app connects on boot, same as in
 * production). Run `npm run migration:run` first. This is separate from the unit
 * tests (`npm test`), which need no database.
 */
describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // Same contract setup as main.ts (shared, so the two cannot drift).
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/template/meta describes the stack', async () => {
    const res = await request(app.getHttpServer()).get('/api/template/meta').expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.backend).toBe('NestJS + TypeORM');
  });

  it('GET /api/template-items returns the wrapped list', async () => {
    const res = await request(app.getHttpServer()).get('/api/template-items').expect(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('rejects an invalid status on create (400 invalid_request + details)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/template-items')
      .send({ name: 'e2e', status: 'nope' })
      .expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe('invalid_request');
    expect(res.body.details).toEqual([
      expect.objectContaining({ field: 'status', message: expect.any(String) }),
    ]);
  });

  it('update of an unknown uuid -> 404 not_found', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/template-items/00000000-0000-4000-8000-000000000000')
      .send({ name: 'nobody' })
      .expect(404);
    expect(res.body).toEqual({ ok: false, message: 'item not found', code: 'not_found' });
  });

  it('a non-uuid :uuid param -> 400 invalid_request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/template-items/not-a-uuid')
      .send({ name: 'x' })
      .expect(400);
    expect(res.body).toMatchObject({ ok: false, code: 'invalid_request' });
  });

  it('registering an existing username -> 409 conflict', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'whatever-123' })
      .expect(409);
    expect(res.body).toMatchObject({ ok: false, code: 'conflict' });
  });

  it('wrong password -> 401 invalid_credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong-password' })
      .expect(401);
    expect(res.body).toEqual({ ok: false, message: 'invalid credentials', code: 'invalid_credentials' });
  });

  it('logs in the demo user and reads the protected /me route', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'changeme' })
      .expect(200);
    const token = login.body.data.accessToken as string;
    expect(token).toBeTruthy();

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.username).toBe('admin');
  });

  it('rejects /me without a token (401 not_signed_in)', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    expect(res.body).toMatchObject({ ok: false, code: 'not_signed_in' });
  });

  it('DELETE is not a route at all (404 not_found envelope)', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/template-items/00000000-0000-4000-8000-000000000000')
      .expect(404);
    expect(res.body).toMatchObject({ ok: false, code: 'not_found' });
  });
});
