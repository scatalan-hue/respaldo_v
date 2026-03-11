import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { User } from '../../users/entities/user.entity';
import { IDictionary } from '../../../common/interfaces/dictionary.interface';
import { CreateNotificationInput } from '../../../general/notifications/notification/dto/inputs/create-notification.input';
import { TypeNotification } from '../../../general/notifications/notification/enums/type-notification.enum';
import { NotificationTypes } from '../../../general/notifications/notification-config/enums/notification-type.enum';
import { EmailRecipient } from '../../../external-api/certimails/email/dto/args/email.args';
import { RecipientType } from '../../../external-api/certimails/email/interface/email.enum';
import { createNotificationEvent } from '../../../general/notifications/notification/constants/events.constants';
import { sendVerificationCodeToJwtEvent, signupEmailEvent } from '../constants/events.constants';

@Injectable()
export class AuthNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async signupEmail(context: IContext, user: User, confirmationCode: string): Promise<Notification> {
    if (!user.email) return;

    const dictionary: IDictionary = {};
    dictionary['CODE'] = confirmationCode;

    const notificationInput: CreateNotificationInput = new CreateNotificationInput();
    notificationInput.type = TypeNotification.Email;
    notificationInput.userId = user.id;
    notificationInput.typeConfig = NotificationTypes.Token;
    notificationInput.subtypeConfig = 'signUp';
    notificationInput.metadata = JSON.stringify(dictionary);

    const recipients: EmailRecipient[] = [
      {
        email: user.email,
        type: RecipientType.Destinatary,
        aditionalInfo: {
          name: user.name,
          lastName: user.lastName,
          phone: user.phoneNumber,
          id: user.identificationNumber,
        },
      },
    ];
    notificationInput.emailRecipients = recipients;

    const [result] = await this.eventEmitter.emitAsync(createNotificationEvent, { context, input: notificationInput });
    if (!(result instanceof Notification)) {
      throw new BadRequestException('An error occurred while creating the notification: ' + result);
    }

    return result;
  }

  async sendVerificationCodeToJwt(context: IContext, user: User, code: string, type: TypeNotification): Promise<Notification> {
    if ((type === TypeNotification.Email && !user.email) || (type === TypeNotification.Sms && !user.phoneNumber)) return;

    const dictionary: IDictionary = {};
    dictionary['CODE'] = code;

    const notificationInput: CreateNotificationInput = new CreateNotificationInput();
    notificationInput.type = type === TypeNotification.Email ? TypeNotification.Email : TypeNotification.Sms;
    notificationInput.userId = user.id;
    notificationInput.typeConfig = NotificationTypes.Token;
    notificationInput.subtypeConfig = 'validateJwt';
    notificationInput.metadata = JSON.stringify(dictionary);

    if (type === TypeNotification.Email) {
      const recipients: EmailRecipient[] = [
        {
          email: user.email,
          type: RecipientType.Destinatary,
          aditionalInfo: {
            name: user.name,
            lastName: user.lastName,
            phone: user.phoneNumber,
            id: user.identificationNumber,
          },
        },
      ];
      notificationInput.emailRecipients = recipients;
    }

    if (type === TypeNotification.Sms) {
      notificationInput.smsRecipient = {
        phone: user.phoneNumber,
        email: user.email,
        name: user.name,
      };
    }

    const [result] = await this.eventEmitter.emitAsync(createNotificationEvent, { context, input: notificationInput });
    if (!(result instanceof Notification)) {
      throw new BadRequestException('An error occurred while creating the notification: ' + result);
    }

    return result;
  }

  @OnEvent(signupEmailEvent)
  async onSignupEmail({ context, user, confirmationCode }: { context: IContext; user: User; confirmationCode: string }): Promise<Notification> {
    return this.signupEmail(context, user, confirmationCode);
  }

  @OnEvent(sendVerificationCodeToJwtEvent)
  async onSendVerificationCodeToJwt({
    context,
    user,
    code,
    type,
  }: {
    context: IContext;
    user: User;
    code: string;
    type: TypeNotification;
  }): Promise<Notification> {
    return this.sendVerificationCodeToJwt(context, user, code, type);
  }
}
