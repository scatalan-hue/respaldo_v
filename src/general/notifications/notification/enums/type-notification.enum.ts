import { registerEnumType } from '@nestjs/graphql';

export enum TypeNotification {
  Email = 'email',
  Sms = 'sms',
  Wss = 'wss',
  Push = 'push',
  Subscription = 'subscription',
}

registerEnumType(TypeNotification, { name: 'TypeNotification' });
