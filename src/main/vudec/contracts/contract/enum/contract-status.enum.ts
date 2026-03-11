import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  Pending = 'PENDING',
  Error = 'ERROR',
  Send = 'SEND',
}

registerEnumType(Status, { name: 'Status' });
