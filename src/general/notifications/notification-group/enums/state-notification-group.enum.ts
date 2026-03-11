import { registerEnumType } from '@nestjs/graphql';

export enum StateNotificationGroup {
  Draft = 'draft',
  Process = 'process',
  PartialComplete = 'partialComplete',
  Complete = 'complete',
  Error = 'error',
}

registerEnumType(StateNotificationGroup, { name: 'StateNotificationGroup' });
