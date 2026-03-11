import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TransactionHistoryService } from './services/transaction-history.service';
import { TransactionHistoryResolver } from './resolvers/transaction-history.resolver';
import { TransactionHistory } from './entities/transaction-history.entity';
import { TransactionHistoryView } from './entities/view/transaction-history.view.entity';
import { TransactionHistoryViewResolver } from './resolvers/view/transaction-history.view.resolver';
import { TransactionHistoryViewService } from './services/view/transaction-history.view.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionHistory, TransactionHistoryView])],
  providers: [TransactionHistoryResolver, TransactionHistoryViewResolver, TransactionHistoryService, TransactionHistoryViewService],
  exports: [TransactionHistoryService, TransactionHistoryViewService],
})
export class TransactionHistoryModule {}
