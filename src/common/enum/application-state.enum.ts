import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationState {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
  Canceled = 'canceled',
  Error = 'error',
}

registerEnumType(ApplicationState, { name: 'ApplicationState' });
