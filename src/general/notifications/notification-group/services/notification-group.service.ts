import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationGroupInput } from '../dto/inputs/create-notification-group.input';
import { UpdateNotificationGroupInput } from '../dto/inputs/update-notification-group.input';
import { NotificationGroup } from '../entities/notification-group.entity';
import { Repository } from 'typeorm';
import { NotificationConfigService } from '../../notification-config/services/notification-config.service';
import { NotificationService } from '../../notification/services/notification.service';
import { findNotificationGroupById } from '../constants/events.constants';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { findGroupById, findGroupByNotification } from '../../../../security/groups/constants/events.constants';
import { Group } from '../../../../security/groups/entities/groups.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: NotificationGroup,
  createInputType: CreateNotificationGroupInput,
  updateInputType: UpdateNotificationGroupInput,
});

@Injectable()
export class NotificationGroupService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationConfigService: NotificationConfigService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async afterCreate(
    context: IContext,
    repository: Repository<NotificationGroup>,
    entity: NotificationGroup,
    createInput: CreateNotificationGroupInput,
  ): Promise<void> {
    if (createInput.notificationConfigId)
      entity.notificationConfig = await this.notificationConfigService.findOne(context, createInput.notificationConfigId, true);

    if (createInput.groupId) {
      const [result] = await this.eventEmitter.emitAsync(findGroupById, {
        context,
        input: createInput.groupId,
      });
      if (!(result instanceof Group)) {
        throw new BadRequestException('An error occurred obtaining group: ' + result);
      }
      entity.group = result;
    }

    await this.fillGroup(context, entity, createInput);
  }

  async fillGroup(context: IContext, entity: NotificationGroup, createInput: CreateNotificationGroupInput) {
    const [groups] = (await this.eventEmitter.emitAsync(findGroupByNotification, { context, input: createInput.notificationConfigId })) as [Group[]];
    if (!groups || !Array.isArray(groups) || groups?.some((item) => !(item instanceof Group)))
      throw new NotFoundException('An error occurred obtaining groups: ' + groups);

    for (const group of groups) {
      const users = await group.users;
      await this.notificationService.createNotificationByGroup(context, users, entity, createInput.notificationConfigId, createInput.metadata);
    }
  }

  @OnEvent(findNotificationGroupById)
  async findOneById({ context, input }: { context: IContext; input: string }): Promise<NotificationGroup> {
    try {
      return await this.findOne(context, input, true);
    } catch (error) {
      return error;
    }
  }
}
