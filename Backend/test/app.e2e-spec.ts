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

  it('rejects an invalid status on create (400 + ok:false)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/template-items')
      .send({ name: 'e2e', status: 'nope' })
      .expect(400);
    expect(res.body.ok).toBe(false);
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

  it('rejects /me without a token (401)', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });
});
