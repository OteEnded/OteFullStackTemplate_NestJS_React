import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';

/**
 * Registers the scheduler. With no active @Cron/@Interval methods this is inert,
 * so it is safe to keep enabled. Define jobs in CronService.
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService],
})
export class CronModule {}
