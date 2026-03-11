// Documentation: [Vudec Module Documentation](../../docs/main.md)

import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionHistoryModule } from './transaction-history/transaction-history.module';
import { TransactionLoadModule } from './transaction-load/transaction-load.module';

@Module({
  imports: [
    TransactionModule,
    TransactionHistoryModule,
    TransactionLoadModule,
  ],
})
export class TransactionsModule {}
