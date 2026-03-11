import { registerEnumType } from '@nestjs/graphql';

export enum NotificationTypes {
  Token = 'token',
  General = 'general',
}

registerEnumType(NotificationTypes, { name: 'NotificationType' });
