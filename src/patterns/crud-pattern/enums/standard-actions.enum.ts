import { registerEnumType } from '@nestjs/graphql';

export enum StandardActions {
  Create = 'Create',
  Update = 'Update',
  Remove = 'Remove',
  SoftRemove = 'SoftRemove',
}

registerEnumType(StandardActions, { name: 'StandardActions' });
