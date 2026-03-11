import { registerEnumType } from '@nestjs/graphql';

export enum StateNotification {
  Draft = 'draft',
  Complete = 'complete',
  Error = 'error',
}

registerEnumType(StateNotification, { name: 'StateNotification' });
