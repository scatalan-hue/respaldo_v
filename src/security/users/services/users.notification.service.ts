import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { IDictionary } from '../../../common/interfaces/dictionary.interface';
import { EmailRecipient } from '../../../external-api/certimails/email/dto/args/email.args';
import { RecipientType } from '../../../external-api/certimails/email/interface/email.enum';
import { NotificationSubtypesE } from '../../../general/notifications/notification-config/enums/notification-subtype.enum';
import { NotificationTypes } from '../../../general/notifications/notification-config/enums/notification-type.enum';
import { createNotificationEvent } from '../../../general/notifications/notification/constants/events.constants';
import { CreateNotificationInput } from '../../../general/notifications/notification/dto/inputs/create-notification.input';
import { Notification } from '../../../general/notifications/notification/entities/notification.entity';
import { TypeNotification } from '../../../general/notifications/notification/enums/type-notification.enum';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { recoverPasswordEmailEvent } from '../../auth/constants/events.constants';
import { temporalPasswordEvent } from '../constants/events.constants';
import { User } from '../entities/user.entity';
import { UserKeyOrigin } from '../enums/user-key-origin.enum';
import { profileDefaultEvent } from 'src/external-api/certimails/profile/constants/events.constant';

@Injectable()
export class UsersNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private readonly I18N_SPACE: string = I18N_SPACE.User;

  async recoverPasswordEmail(context: IContext, user: User, code: string, expCode: string): Promise<Notification> {
    if (!user.email) return;

    const organizationUsers = await Promise.resolve(user?.organizationUsers);
    const organization = await Promise.resolve(organizationUsers?.[0]?.organization);
    const organizationProducts = await Promise.resolve(organization?.organizationProducts);
    let profile = await Promise.resolve(organizationProducts?.[0]?.profile);

    if (!profile) {
      const [defaultProfile] = await this.eventEmitter.emitAsync(profileDefaultEvent, {
        context,
      });

      profile = await Promise?.resolve(defaultProfile);
    }

    if (!profile) return;

    const department = await Promise.resolve(organization?.department);
    const logo = await Promise.resolve(organization?.logo);

    const dictionary: IDictionary = {};
    dictionary['LOGO'] = `${process.env.APP_URL}:${process.env.APP_PORT}/attachment/files/static/${logo?.id}.${logo?.fileExtension}`;
    dictionary['ENTIDAD'] = organization?.name;
    dictionary['BENNAME'] = `${user?.name} ${user?.lastName}`;
    dictionary['DEPENDENCIA'] = department?.name;
    dictionary['TOKEN'] = code;
    dictionary['ENTEMAIL'] = organization?.email;
    dictionary['ENTPHONE'] = organization?.phone;
    dictionary['ENTHORARIO'] = organization?.schedule;
    dictionary['ENTNIT'] = organization?.nit;
    dictionary['ENTDIRECCION'] = organization?.address;
    dictionary['ENTPOSTAL'] = '';
    dictionary['URL'] = `${process.env.STATE === 'prod' ? process.env.FRONT_URL : 'http://localhost:3000'}/recovery/recovery-code?email=${
      user.email
    }&expCode=${expCode}&authCode=${code}`;

    const notificationInput: CreateNotificationInput = new CreateNotificationInput();
    notificationInput.typeConfig = NotificationTypes.Token;
    notificationInput.subtypeConfig = UserKeyOrigin.RecoverPassword;
    notificationInput.userId = user?.id;
    notificationInput.metadata = JSON.stringify(dictionary);
    notificationInput.type = TypeNotification.Email;

    const recipients: EmailRecipient[] = [
      {
        email: user?.email,
        type: RecipientType?.Destinatary,
        aditionalInfo: {
          name: user?.name,
          lastName: user?.lastName,
          phone: user?.phoneNumber,
          id: user?.identificationNumber,
        },
      },
    ];
    notificationInput.emailRecipients = recipients;
    notificationInput.profileId = profile?.id;

    const [result] = await this.eventEmitter.emitAsync(createNotificationEvent, { context, input: notificationInput });

    if (!(result instanceof Notification)) throw new BadRequestException('An error occurred while creating the notification: ' + result);

    return result as Notification;
  }

  async temporalPassword(context: IContext, user: User, code: string): Promise<Notification> {
    if (!user.email) return;

    const dictionary: IDictionary = {};

    const organization = await Promise.resolve(context.organization);
    const logo = await Promise.resolve(organization.logo);
    const department = await Promise.resolve(organization.department);

    dictionary['LOGO'] = `${process.env.APP_URL}:${process.env.APP_PORT}/attachment/files/static/${logo.id}.${logo.fileExtension}`;
    dictionary['ENTIDAD'] = organization.name;
    dictionary['DEPENDENCIA'] = department.name;
    dictionary['BENNAME'] = `${user.name} ${user.lastName}`;
    dictionary['CONTRASENA'] = code;
    dictionary['ENTEMAIL'] = organization.email;
    dictionary['ENTPHONE'] = organization.phone;
    dictionary['ENTHORARIO'] = organization.schedule;
    dictionary['ENTNIT'] = organization.nit;
    dictionary['ENTDIRECCION'] = organization.address;
    dictionary['ENTPOSTAL'] = '';

    // const [token] = await this.eventEmitter.emitAsync(getTokenAuthWithUserEvent, { context, user });

    // dictionary['URL'] = buildUrl(process.env.MAGNETO_URL, MagnetoEndpoints.RedirectLinkAuth + token, {
    //   redirectTo: 'tempPassFlag',
    //   tempPass: code,
    // });

    const profile = await Promise.resolve(context.organizationProduct.profile);

    const notificationInput: CreateNotificationInput = new CreateNotificationInput();
    notificationInput.typeConfig = NotificationTypes.Token;
    notificationInput.subtypeConfig = NotificationSubtypesE.temporalPassword;
    notificationInput.userId = user.id;
    notificationInput.metadata = JSON.stringify(dictionary);
    notificationInput.type = TypeNotification.Email;
    notificationInput.profileId = profile.id;

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
      throw new BadRequestException(
        sendResponse(context, this.I18N_SPACE, 'temporalPassword.error', {
          result,
        }),
      );
    }

    return result;
  }

  @OnEvent(recoverPasswordEmailEvent)
  async onRecoverPasswordEmail({ context, user, code, expCode }: { context: IContext; user: User; code: string; expCode: string }): Promise<Notification> {
    const response = await this.recoverPasswordEmail(context, user, code, expCode);

    return response;
  }

  @OnEvent(temporalPasswordEvent)
  async onTemporalPassword({ context, user, code }: { context: IContext; user: User; code: string }): Promise<Notification> {
    return await this.temporalPassword(context, user, code);
  }
}
