import { findNotificationConfigById, findNotificationConfigByType } from '../../notification-config/constants/events.constants';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { createNotificationEvent, createNotificationQueue, notificationProcessor } from '../constants/events.constants';
import { NotificationConfig } from '../../notification-config/entities/notification-config.entity';
import { findNotificationGroupById } from '../../notification-group/constants/events.constants';
import { NotificationGroup } from '../../notification-group/entities/notification-group.entity';
import { EmailService } from '../../../../external-api/certimails/email/service/email.service';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EmailArgs } from '../../../../external-api/certimails/email/dto/args/email.args';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { WssService } from '../../../../external-api/certimails/wss/service/wss.service';
import { SmsService } from '../../../../external-api/certimails/sms/service/sms.service';
import { WssArgs } from '../../../../external-api/certimails/wss/dto/args/wss.args';
import { SmsArgs } from '../../../../external-api/certimails/sms/dto/args/sms.args';
import { CreateNotificationInput } from '../dto/inputs/create-notification.input';
import { UpdateNotificationInput } from '../dto/inputs/update-notification.input';
import { UsersService } from '../../../../security/users/services/users.service';
import { User } from '../../../../security/users/entities/user.entity';
import { StateNotification } from '../enums/state-notification.enum';
import { TypeNotification } from '../enums/type-notification.enum';
import { StatePersistent } from '../enums/state-persistent.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Notification } from '../entities/notification.entity';
import { PubSub } from 'graphql-subscriptions';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

export const serviceStructure = CrudServiceStructure({
  entityType: Notification,
  createInputType: CreateNotificationInput,
  updateInputType: UpdateNotificationInput,
});

@Injectable()
export class NotificationService extends CrudServiceFrom(serviceStructure) {
  constructor(
    @InjectQueue(notificationProcessor)
    private readonly notificationQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly wssService: WssService,
    private readonly usersService: UsersService,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {
    super();
  }

  async beforeCreate(context: IContext, repository: Repository<Notification>, entity: Notification, createInput: CreateNotificationInput): Promise<void> {
    const user = await this.usersService.findOne(context, createInput.userId ?? context.user?.id, false);

    if (createInput.notificationGroupId) {
      const [notificationGroup] = await this.eventEmitter.emitAsync(findNotificationGroupById, { context, input: createInput.notificationGroupId });
      if (!(notificationGroup instanceof NotificationGroup)) {
        throw new BadRequestException('An error occurred obtaining notification group: ' + notificationGroup);
      }
      entity.notificationGroup = notificationGroup;
    }

    const [notificationConfig] = await this.eventEmitter.emitAsync(findNotificationConfigByType, {
      context,
      profileId: createInput.profileId,
      type: createInput.typeConfig,
      subtype: createInput.subtypeConfig,
      orFail: true,
    });
    if (!(notificationConfig instanceof NotificationConfig)) {
      throw new BadRequestException('Notification settings for the profile not exist or not found');
    }
    entity.notificationConfig = notificationConfig;

    entity.hasPersistent = notificationConfig.hasPersistent;
    entity.persistentExpiration = notificationConfig.persistentExpiration;
    entity.user = user;

    if (entity.type === TypeNotification.Email) {
      await this.__buildEmail(entity, notificationConfig, createInput);
    } else if (entity.type === TypeNotification.Sms) {
      await this.__buildSms(entity, notificationConfig, createInput);
    } else if (entity.type === TypeNotification.Wss) {
      await this.__buildWss(entity, notificationConfig, createInput);
    } else if (entity.type === TypeNotification.Subscription) {
      entity.stateNotification = StateNotification.Complete;
      entity.hasPersistent = true;
      entity.statePersistent = StatePersistent.Send;
    } else if (entity.type === TypeNotification.Push) {
      return;
    }
  }

  async afterCreate(context: IContext, repository: Repository<Notification>, entity: Notification, createInput: CreateNotificationInput): Promise<void> {
    if (entity.type === TypeNotification.Subscription) {
      await this.__buildSubcription(context?.user?.id, entity, createInput);
    }
  }

  private async __buildSubcription(contextUserId: string, entity: Notification, createInput: CreateNotificationInput) { }

  private async __buildEmail(entity: Notification, notificationConfig: NotificationConfig, createInput: CreateNotificationInput) {
    const emailArgs: EmailArgs = new EmailArgs();

    emailArgs.template = {
      principal: notificationConfig.emailPrincipalCode,
      secondary: notificationConfig.emailDuplicateCode,
      metadata: createInput.metadata,
    };

    emailArgs.subject = createInput.subject ?? notificationConfig.name;
    emailArgs.twoSteps = notificationConfig.hasTwoStepsEmail;
    emailArgs.notificationGroupId = createInput.notificationGroupId;
    emailArgs.notificationGroupName = createInput.notificationGroupName;
    emailArgs.profileId = notificationConfig.profile.id;
    emailArgs.recipients = createInput.emailRecipients;

    const reponse = await this.emailService.createEmail(emailArgs);

    if (reponse.HasError) {
      entity.externalMessage = reponse.ErrMessage;
      entity.stateNotification = StateNotification.Error;
    } else {
      entity.externalId = reponse.CorGUID;
      entity.stateNotification = StateNotification.Complete;
    }
    return;
  }

  private async __buildSms(entity: Notification, notificationConfig: NotificationConfig, createInput: CreateNotificationInput) {
    const smsArgs: SmsArgs = new SmsArgs();

    smsArgs.message = notificationConfig.smsBody;
    smsArgs.subject = notificationConfig.name;
    smsArgs.twoSteps = notificationConfig.hasTwoStepsSms;
    smsArgs.notificationGroupId = createInput.notificationGroupId;
    smsArgs.notificationGroupName = createInput.notificationGroupName;
    smsArgs.profileId = notificationConfig.profile.id;
    smsArgs.recipient = createInput.smsRecipient;
    smsArgs.metadata = createInput.metadata;

    const reponse = await this.smsService.createSms(smsArgs);

    if (reponse.HasError) {
      entity.externalMessage = reponse.ErrMessage;
      entity.stateNotification = StateNotification.Error;
    } else {
      entity.externalId = reponse.SmsGUID;
      entity.stateNotification = StateNotification.Complete;
    }
    return;
  }

  private async __buildWss(entity: Notification, notificationConfig: NotificationConfig, createInput: CreateNotificationInput) {
    const wssArgs: WssArgs = new WssArgs();

    wssArgs.template = {
      code: notificationConfig.wssCode,
      metadata: createInput.metadata,
    };

    wssArgs.subject = notificationConfig.name;
    wssArgs.recipient = createInput.wssRecipient;
    wssArgs.twoSteps = notificationConfig.hasTwoStepsWss;
    wssArgs.notificationGroupId = createInput.notificationGroupId;
    wssArgs.notificationGroupName = createInput.notificationGroupName;
    wssArgs.profileId = notificationConfig.profile.id;
    wssArgs.recipient = createInput.wssRecipient;

    const response = await this.wssService.createWss(wssArgs);

    if (response.HasError) {
      entity.externalMessage = response.ErrMessage;
      entity.stateNotification = StateNotification.Error;
    } else {
      entity.externalId = response.WssGUID;
      entity.stateNotification = StateNotification.Complete;
    }
    return;
  }

  async createNotificationByGroup(context: IContext, users: User[], notificationGroup: NotificationGroup, notificationConfigId: string, metadata: string) {
    if (users && Array.isArray(users)) {
      for (const user of users) {
        const [notificationConfig] = await this.eventEmitter.emitAsync(findNotificationConfigById, { context, input: notificationConfigId });
        if (!(notificationConfig instanceof NotificationConfig)) {
          throw new BadRequestException('An error occurred obtaining notification config: ' + notificationConfig);
        }

        const typeToFieldMap: Record<TypeNotification, keyof typeof notificationConfig> = {
          [TypeNotification.Email]: 'hasEmail',
          [TypeNotification.Sms]: 'hasSms',
          [TypeNotification.Push]: 'hasPush',
          [TypeNotification.Wss]: 'hasWss',
          [TypeNotification.Subscription]: 'hasSubscription',
        };

        for (const type in TypeNotification) {
          const notificationType = TypeNotification[type as keyof typeof TypeNotification];
          const field = typeToFieldMap[notificationType];

          if (notificationConfig[field]) {
            const createNotificationInput: CreateNotificationInput = {
              type: notificationType,
              typeConfig: notificationConfig.type,
              subtypeConfig: notificationConfig.subtype,
              userId: user.id,
              notificationGroupId: notificationGroup.id,
              notificationGroupName: notificationGroup.name,
              emailRecipients: this.emailService.getRecipientByUser(user),
              smsRecipient: this.smsService.getDestinataryByUser(user),
              wssRecipient: this.wssService.getDestinataryByUser(user),
              metadata,
            };

            await this.notificationQueue.add(
              createNotificationQueue,
              {
                user,
                input: createNotificationInput,
              },
              {
                priority: 2,
                attempts: 0,
                removeOnFail: true,
                removeOnComplete: true,
              },
            );

            await this.create(context, createNotificationInput);
          }
        }
      }
    } else {
      throw new NotFoundException(`group ${notificationGroup.name} has no associated users`);
    }
  }

  async notificationCountByUser(context: IContext, userId: string) {
    const repository = this.getRepository(context);
    const countNotification = await repository.count({
      where: [
        {
          statePersistent: StatePersistent.Send,
          hasPersistent: true,
          user: {
            id: userId,
          },
        },
        {
          statePersistent: StatePersistent.Receive,
          hasPersistent: true,
          user: {
            id: userId,
          },
        },
      ],
    });

    if (countNotification != 0)
      repository.update(
        {
          user: {
            id: userId,
          },
        },
        {
          statePersistent: StatePersistent.Receive,
        },
      );
    this.pubSub.publish(userId, countNotification);
  }

  @OnEvent(createNotificationEvent)
  async createNotification({ context, input }: { context: any; input: CreateNotificationInput }) {
    try {
      context.user = context.user ? context.user : context?.req?.user;

      return await this.create(context, input);
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
