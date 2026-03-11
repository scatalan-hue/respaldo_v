import { registerEnumType } from '@nestjs/graphql';

export enum TypeNotificationGroup {
  Automatic = 'automatic',
  Manual = 'manual',
}

registerEnumType(TypeNotificationGroup, { name: 'TypeNotificationGroup' });
