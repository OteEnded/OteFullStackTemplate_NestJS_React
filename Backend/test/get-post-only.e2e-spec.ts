import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * GET + POST only is ENFORCED at boot: the real AppModule must refuse to start
 * when any controller route uses PATCH / PUT / DELETE. Needs the DB (AppModule
 * connects on boot), like the rest of the e2e suite.
 */

@Controller('drift-delete')
class DeleteRouteController {
  @Get()
  list() {
    return [];
  }

  @Delete(':uuid')
  remove() {
    return true;
  }
}

@Controller('drift-patch')
class PatchRouteController {
  @Patch(':uuid')
  update() {
    return true;
  }
}

@Controller('drift-put')
class PutRouteController {
  @Put(':uuid')
  replace() {
    return true;
  }
}

@Controller('fine')
class GetPostController {
  @Get()
  list() {
    return [];
  }

  @Post(':uuid/archive')
  archive() {
    return true;
  }
}

async function bootWith(controller: new (...args: never[]) => unknown) {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [controller],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  try {
    await app.init();
  } finally {
    await app.close().catch(() => undefined);
  }
}

describe('GET + POST only (enforced at boot, e2e)', () => {
  it.each([
    ['DELETE', DeleteRouteController, '/drift-delete/:uuid'],
    ['PATCH', PatchRouteController, '/drift-patch/:uuid'],
    ['PUT', PutRouteController, '/drift-put/:uuid'],
  ])('refuses to start with a %s route', async (method, controller, path) => {
    const boot = bootWith(controller);
    await expect(boot).rejects.toThrow(/GET \+ POST only/);
    await expect(boot).rejects.toThrow(new RegExp(`${method} \\S*${path.replace(/[/:]/g, '\\$&')}`));
    await expect(boot).rejects.toThrow(/POST \S+ or POST \S+\/<action>/);
  });

  it('starts normally when every route is GET or POST', async () => {
    await expect(bootWith(GetPostController)).resolves.toBeUndefined();
  });
});
