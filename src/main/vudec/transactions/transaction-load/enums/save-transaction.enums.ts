import { registerEnumType } from '@nestjs/graphql';

export enum LoadStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  ERROR = 'Error',
  IN_PROCESS = 'InProcess'
}
registerEnumType(LoadStatus, { name: 'LoadStatus' });

