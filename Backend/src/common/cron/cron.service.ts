import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression, Interval } from '@nestjs/schedule';

/**
 * Cron scaffold (parity with the Fastify template's cron plugin).
 *
 * `@nestjs/schedule` is wired in via CronModule. To add a scheduled job,
 * uncomment the import above and a method like the example below. Decorated
 * methods are discovered and scheduled automatically — no manual registration.
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  // @Cron(CronExpression.EVERY_10_SECONDS, { name: 'example' })
  // handleExample() {
  //   this.logger.log('Cron running...');
  //   // your task here
  // }

  // @Interval(60_000)
  // handleIntervalExample() {
  //   this.logger.log('Interval running...');
  // }
}
