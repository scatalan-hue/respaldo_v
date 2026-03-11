import { registerEnumType } from '@nestjs/graphql';

export enum TransactionStatus {
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
  IN_PROCESS = 'IN_PROCESS',
}

registerEnumType(TransactionStatus, { name: 'TransactionStatus' });
