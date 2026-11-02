import { All, Controller, Delete, Get, Head, Options, Patch, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configureApp } from '../../app.setup';
import { GetPostOnlyModule } from './get-post-only.module';

@Controller('ok')
class AllowedController {
  @Get() list() {
    return [];
  }
  @Post(':uuid') update() {
    return true;
  }
  @Post(':uuid/archive') archive() {
    return true;
  }
  @Head() head() {
    return undefined;
  }
  @Options() options() {
    return undefined;
  }
}

@Controller('items')
class DeleteController {
  @Delete(':uuid') remove() {
    return true;
  }
}

@Controller('items')
class PatchController {
  @Patch(':uuid') update() {
    return true;
  }
}

@Controller('anything')
class AllController {
  @All() any() {
    return true;
  }
}

async function boot(controller: new () => unknown) {
  const moduleRef = await Test.createTestingModule({
    imports: [GetPostOnlyModule],
    controllers: [controller],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  try {
    await app.init();
  } finally {
    await app.close().catch(() => undefined);
  }
}

describe('GetPostOnlyModule (GET + POST only, enforced at boot)', () => {
  it('boots with GET, POST, HEAD and OPTIONS routes', async () => {
    await expect(boot(AllowedController)).resolves.toBeUndefined();
  });

  it('refuses @Delete() and states the rule + the POST alternative', async () => {
    const err: Error = await boot(DeleteController).then(
      () => {
        throw new Error('boot should have failed');
      },
      (e: Error) => e,
    );
    expect(err.message).toMatch(/GET \+ POST only/);
    expect(err.message).toContain('DELETE /api/items/:uuid (DeleteController.remove)');
    expect(err.message).toContain(
      'use POST /api/items/:uuid or POST /api/items/:uuid/<action> instead',
    );
  });

  it('refuses @Patch()', async () => {
    await expect(boot(PatchController)).rejects.toThrow(/PATCH \/api\/items\/:uuid/);
  });

  it('refuses @All() (it includes DELETE)', async () => {
    await expect(boot(AllController)).rejects.toThrow(/ALL \/api\/anything/);
  });
});
