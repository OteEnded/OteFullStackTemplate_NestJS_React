import { Injectable, Module, OnModuleInit, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ApplicationConfig, DiscoveryModule, DiscoveryService, MetadataScanner } from '@nestjs/core';

// ⭐ GET + POST only. Ote, 2026-11-01: "i like GET+POST-only style ... i think this
// is commom pattern". Updates and actions are POST /x/:uuid or POST /x/:uuid/<action>.
// Apps built from the templates drifted to PATCH/PUT/DELETE because coding agents
// write REST verbs by habit — so the rule is ENFORCED here, at boot, not just
// written down: app.init() / app.listen() throws and the server does not start.
// HEAD and OPTIONS (CORS preflight) are fine. @All() is refused (it includes DELETE).
// Same rule as the Fastify template v2 (Backend/app/plugins/guards.js there).
export const ALLOWED_METHODS: ReadonlySet<RequestMethod> = new Set([
  RequestMethod.GET,
  RequestMethod.POST,
  RequestMethod.HEAD,
  RequestMethod.OPTIONS,
]);

export interface RouteViolation {
  method: string;
  path: string;
  handler: string;
}

const asArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [value === undefined ? '' : String(value)];

const joinPath = (...parts: string[]): string =>
  '/' + parts.map((p) => p.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');

/**
 * Walks every controller handler at boot (DiscoveryService + MetadataScanner,
 * reading the @Get/@Post/@Delete/... metadata) and refuses to start if any
 * route uses a method outside ALLOWED_METHODS.
 */
@Injectable()
export class GetPostOnlyPolicy implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly appConfig: ApplicationConfig,
  ) {}

  onModuleInit(): void {
    const violations = this.findViolations();
    if (violations.length > 0) {
      throw new Error(GetPostOnlyPolicy.describe(violations));
    }
  }

  findViolations(): RouteViolation[] {
    const prefix = this.appConfig.getGlobalPrefix?.() ?? '';
    const violations: RouteViolation[] = [];

    for (const wrapper of this.discovery.getControllers()) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;
      const proto = Object.getPrototypeOf(instance);
      const controllerPaths = asArray(Reflect.getMetadata(PATH_METADATA, metatype));

      for (const name of this.scanner.getAllMethodNames(proto)) {
        const handler = proto[name];
        const method: RequestMethod | undefined = Reflect.getMetadata(METHOD_METADATA, handler);
        if (method === undefined || ALLOWED_METHODS.has(method)) continue;

        const handlerPaths = asArray(Reflect.getMetadata(PATH_METADATA, handler));
        for (const base of controllerPaths) {
          for (const sub of handlerPaths) {
            violations.push({
              method: RequestMethod[method],
              path: joinPath(prefix, base, sub),
              handler: `${metatype.name}.${name}`,
            });
          }
        }
      }
    }
    return violations;
  }

  static describe(violations: RouteViolation[]): string {
    const lines = violations.map(
      (v) =>
        `  - ${v.method} ${v.path} (${v.handler}): use POST ${v.path} or POST ${v.path}/<action> instead`,
    );
    return [
      `Refusing to start: this API is GET + POST only (HEAD/OPTIONS allowed); found ${violations.length} route(s) using another method:`,
      ...lines,
      'Updates and actions are POST /x/:uuid or POST /x/:uuid/<action>. See AI_CarryOn.md standing rules.',
    ].join('\n');
  }
}

/** Imported once by AppModule; enforces the GET + POST rule on every controller. */
@Module({
  imports: [DiscoveryModule],
  providers: [GetPostOnlyPolicy],
})
export class GetPostOnlyModule {}
