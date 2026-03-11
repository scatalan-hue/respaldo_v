import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { CronJob as NestCronJob } from '@nestjs/schedule/node_modules/cron';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { createDynamicScheduleEvent, findScheduleByIdEvent, updateDynamicScheduleEvent } from '../constants/events.constants';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleType } from '../enums/schedule-type.enum';
import { notifyContractsPendingEvent } from '../../../main/vudec/contracts/contract/constants/views/events.constants';

@Injectable()
export class DynamicScheduleService implements OnApplicationBootstrap {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  async onApplicationBootstrap() {
    const schedules = await this.scheduleRepo.find({
      where: {
        deletedAt: null,
      },
    });

    if (!!schedules && schedules.length > 0)
      schedules.forEach((schedule) => {
        if (schedule.active)
          this.addCronJob(
            { user: null },
            schedule.id,
            schedule.name,
            schedule.type as ScheduleType,
            schedule.cronExpression,
            schedule.description,
            schedule.active,
          );
      });
  }

  async addCronJob(context: IContext, id: string, name: string, type: ScheduleType, cronTime: string, description?: string, active?: boolean) {
    const job = await new (CronJob as unknown as typeof NestCronJob)(cronTime, async () => {
      switch (type) {
        case ScheduleType.NOTIFY_MOVEMENTS: {
          await this.eventEmitter.emitAsync(notifyContractsPendingEvent, {
            context,
          });
          break;
        }
        case ScheduleType.JOB_DUMMY: {
          console.log(`${type} (descr: ${description}) ejecutado según: ${cronTime}`);
          break;
        }
        default: {
          break;
        }
      }
    });

    if (active) {
      await this.schedulerRegistry.addCronJob(name, job);

      job.start();
    }
  }

  async updateCronJob(context: IContext, schedule: Schedule) {
    if (this.schedulerRegistry.doesExist('cron', schedule.name)) this.schedulerRegistry.deleteCronJob(schedule.name);

    if (schedule.active) this.addCronJob(context, schedule.id, schedule.name, schedule.type, schedule.cronExpression, schedule.description, schedule.active);
  }

  @OnEvent(createDynamicScheduleEvent)
  async onCreateDynamicSchedule({
    context,
    scheduleInput: { id, name, type, cronExpression, description, active },
  }: {
    context: IContext;
    scheduleInput: Schedule;
  }): Promise<void> {
    await this.addCronJob(context, id, name, type, cronExpression, description, active);
  }

  @OnEvent(updateDynamicScheduleEvent)
  async onUpdateDynamicSchedule({ context, scheduleInput }: { context: IContext; scheduleInput: Schedule }): Promise<void> {
    await this.updateCronJob(context, scheduleInput);
  }
}
