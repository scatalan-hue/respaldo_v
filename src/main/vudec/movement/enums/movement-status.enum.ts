import { registerEnumType } from '@nestjs/graphql';

export enum MovementStatus {
  Error = 'ERROR',
  Send = 'SEND',
  Unsent = 'UNSENT',
  Empty = '',
}

registerEnumType(MovementStatus, { name: 'MovementStatus' });
