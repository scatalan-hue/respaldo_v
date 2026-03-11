import { registerEnumType } from '@nestjs/graphql';

export enum TransactionAction {
  REGISTER = 'REGISTER',
  UPDATE = 'UPDATE',
  REVERT = 'REVERT'
}

registerEnumType(TransactionAction, { name: 'TransactionAction' });
