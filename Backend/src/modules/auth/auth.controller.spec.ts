import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Controller-level test with a mocked AuthService. The JwtAuthGuard is
 * overridden so we can test the /me handler without verifying a real token.
 */
describe('AuthController', () => {
  let controller: AuthController;
  let auth: jest.Mocked<Pick<AuthService, 'register' | 'login' | 'findById'>>;

  beforeEach(async () => {
    auth = {
      register: jest.fn(),
      login: jest.fn(),
      findById: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AuthController);
  });

  it('register delegates to AuthService.register', async () => {
    auth.register.mockResolvedValue({ id: 1, username: 'alice', createdAt: new Date() });
    await controller.register({ username: 'alice', password: 'secret123' });
    expect(auth.register).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' });
  });

  it('login delegates to AuthService.login', async () => {
    auth.login.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 1, username: 'alice', createdAt: new Date() },
    });
    const res = await controller.login({ username: 'alice', password: 'secret123' });
    expect(res.accessToken).toBe('tok');
  });

  it('me() resolves the user from the token payload', async () => {
    auth.findById.mockResolvedValue({ id: 7, username: 'bob', createdAt: new Date() });
    const res = await controller.me({ sub: 7, username: 'bob' });
    expect(auth.findById).toHaveBeenCalledWith(7);
    expect(res.username).toBe('bob');
  });
});
