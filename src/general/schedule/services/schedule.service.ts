import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { createDynamicScheduleEvent, findScheduleByIdEvent, findSchedulesEvent, updateDynamicScheduleEvent } from '../constants/events.constants';
import { FindSchedulesArgs } from '../dto/args/find-schedule.arg';
import { CreateScheduleInput } from '../dto/inputs/create-schedule.input';
import { UpdateScheduleInput } from '../dto/inputs/update-schedule.input';
import { Schedule } from '../entities/schedule.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: Schedule,
  createInputType: CreateScheduleInput,
  updateInputType: UpdateScheduleInput,
  findArgsType: FindSchedulesArgs,
});

@Injectable()
export class ScheduleService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async beforeCreate(context: IContext, repository: Repository<Schedule>, entity: Schedule, createInput: CreateScheduleInput): Promise<void> {
    const prevEntity = await this.findOneBy(context, { where: { name: createInput.name } });

    if (prevEntity) {
      throw new Error('Ya hay un registro con el mismo nombre');
    }
  }

  async afterCreate(context: IContext, repository: Repository<Schedule>, entity: Schedule, createInput: CreateScheduleInput): Promise<void> {
    await this.eventEmitter.emitAsync(createDynamicScheduleEvent, {
      context,
      scheduleInput: entity,
    });
  }

  async afterUpdate(context: IContext, repository: Repository<Schedule>, entity: Schedule, updateInput: UpdateScheduleInput): Promise<void> {
    await this.eventEmitter.emitAsync(updateDynamicScheduleEvent, {
      context,
      scheduleInput: entity,
    });
  }

  @OnEvent(findSchedulesEvent)
  async onFindSchedules({ context }: { context: IContext }): Promise<Schedule[]> {
    const response = await this.find(context);

    return response;
  }

  @OnEvent(findScheduleByIdEvent)
  async onFindScheduleById({ context, scheduleId }: { context: IContext; scheduleId: string }): Promise<Schedule> {
    const response = await this.findOne(context, scheduleId);

    return response;
  }
}
