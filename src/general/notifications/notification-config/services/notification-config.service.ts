import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationConfigInput } from '../dto/inputs/create-notification-config.input';
import { UpdateNotificationConfigInput } from '../dto/inputs/update-notification-config.input';
import { NotificationConfig } from '../entities/notification-config.entity';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { NotificationTypes } from '../enums/notification-type.enum';
import { NotificationSubtypes } from '../enums/notification-subtype.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { findNotificationConfigById, findNotificationConfigByType } from '../constants/events.constants';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { ProfileService } from '../../../../external-api/certimails/profile/services/profile.service';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { FindNotificationConfigArgs } from '../dto/args/find-notification-config.args';

export const serviceStructure = CrudServiceStructure({
  entityType: NotificationConfig,
  createInputType: CreateNotificationConfigInput,
  updateInputType: UpdateNotificationConfigInput,
});

@Injectable()
export class NotificationConfigService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly profileService: ProfileService) {
    super();
  }

  async getQueryBuilder(context: IContext, args?: FindNotificationConfigArgs): Promise<SelectQueryBuilder<NotificationConfig>> {
    const qb = await super.getQueryBuilder(context, args);

    if (args?.profileId) {
      qb.andWhere('(aa.profileId = :profileId)', {
        profileId: args.profileId,
      });
    }

    return qb;
  }

  async beforeCreate(
    context: IContext,
    repository: Repository<NotificationConfig>,
    entity: NotificationConfig,
    createInput: CreateNotificationConfigInput,
  ): Promise<void> {
    if (createInput.profileId) entity.profile = await this.profileService.findOne(context, createInput.profileId, true);

    const duplicateNotification = await this.findOneBy(context, {
      where: {
        type: entity.type,
        subtype: entity.subtype,
        profile: {
          id: createInput.profileId,
        },
      },
    });

    if (duplicateNotification) {
      throw new BadRequestException('Already exists in the messaging profile a notification with the same type and subtype');
    }

    this.__validateMutation(entity);
  }

  async beforeUpdate(
    context: IContext,
    repository: Repository<NotificationConfig>,
    entity: NotificationConfig,
    updateInput: UpdateNotificationConfigInput,
  ): Promise<void> {
    if (updateInput.profileId) entity.profile = await this.profileService.findOne(context, updateInput.profileId, true);

    this.__validateMutation(entity);
  }

  private __validateMutation(entity: NotificationConfig): void {
    if (!entity.profile) throw new BadRequestException('Certimails profile is required');
    if (entity.hasEmail && !entity.emailPrincipalCode) throw new BadRequestException('Principal email template is missing to use email delivery');
    if (entity.hasEmail && !entity.emailDuplicateCode) throw new BadRequestException('Duplicate email template is missing to use email delivery');
    if (entity.hasSms && !entity.smsBody) throw new BadRequestException('Sms template is missing to use sms delivery');
    if (entity.hasWss && !entity.wssCode) throw new BadRequestException('Wss template is missing to use wss delivery');
    if (entity.hasPersistent && !entity.persistentExpiration) throw new BadRequestException('Expiration date persistent is required');
    if (entity.hasPersistent && !entity.persistentHtml) throw new BadRequestException('Html persistent is required');

    const validSubtypes = NotificationSubtypes[entity.type];
    if (!validSubtypes) throw new BadRequestException(`Invalid notification type: ${entity.type}, does not contain subtypes`);
    if (!validSubtypes.some((validSubtype) => validSubtype.name === entity.subtype))
      throw new BadRequestException(`Invalid subtype for notification type ${entity.type}: ${entity.subtype}`);
  }

  async notificationSubTypes(context: IContext, type: NotificationTypes): Promise<string[]> {
    const subtypes = NotificationSubtypes[type] || [];
    return subtypes.map((subtype) => subtype.name);
  }

  @OnEvent(findNotificationConfigByType)
  async findOneByType({
    context,
    profileId,
    type,
    subtype,
    orFail,
  }: {
    context: IContext;
    profileId: string;
    type: NotificationTypes;
    subtype: string;
    orFail?: boolean;
  }): Promise<NotificationConfig> {
    return await this.findOneBy(
      context,
      {
        where: {
          type,
          subtype,
          profile: {
          id: profileId ?? undefined,
         // default: profileId ? false : true,
          },
        },
      },
      orFail,
    );
  }

  @OnEvent(findNotificationConfigById)
  async findOneById({ context, input }: { context: IContext; input: string }): Promise<NotificationConfig> {
    return await this.findOne(context, input, true);
  }
}
