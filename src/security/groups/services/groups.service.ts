import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupInput } from '../dto/inputs/create-groups.input';
import { UpdateGroupInput } from '../dto/inputs/update-groups.input';
import { Group } from '../entities/groups.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { findGroupById, findGroupByNotification } from '../constants/events.constants';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { NotificationConfigService } from '../../../general/notifications/notification-config/services/notification-config.service';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';

export const serviceStructure = CrudServiceStructure({
  entityType: Group,
  createInputType: CreateGroupInput,
  updateInputType: UpdateGroupInput,
});

@Injectable()
export class GroupsService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly notificationConfigService: NotificationConfigService) {
    super();
  }

  async beforeCreate(context: IContext, repository: Repository<Group>, entity: Group, createInput: CreateGroupInput): Promise<void> {
    if (createInput.notificationConfigId)
      entity.notificationConfig = await this.notificationConfigService.findOne(context, createInput.notificationConfigId, true);
  }

  async beforeUpdate(context: IContext, repository: Repository<Group>, entity: Group, updateInput: UpdateGroupInput): Promise<void> {
    if (updateInput.notificationConfigId)
      entity.notificationConfig = await this.notificationConfigService.findOne(context, updateInput.notificationConfigId, true);
  }

  @OnEvent(findGroupById)
  async findOneById({ context, input }: { context: IContext; input: string }): Promise<Group> {
    try {
      return await this.findOne(context, input, true);
    } catch (error) {
      return error;
    }
  }

  @OnEvent(findGroupByNotification)
  async findByNotification({ context, input }: { context: IContext; input: string }): Promise<Group[]> {
    try {
      const repository = this.getRepository(context);
      const result = await repository.findBy({
        notificationConfig: { id: input },
      });

      if (!result || result.length === 0) throw new NotFoundException(`groups with notification config id ${input} not found`);

      return result;
    } catch (error) {
      return error;
    }
  }
}
