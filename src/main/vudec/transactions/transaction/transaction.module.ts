import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionService } from './services/transaction.service';
import { TransactionResolver } from './resolvers/transaction.resolver';
import { Transaction } from './entities/transaction.entity';
import { TransactionViewResolver } from './resolvers/view/transaction.view.resolver';
import { TransactionViewService } from './services/view/transaction.view.service';
import { TransactionView } from './entities/view/transaction.view.entity';
import { TransactionRecoveryService } from './services/transaction-recovery.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionView]),
    ScheduleModule.forRoot()
  ],
  providers: [
    TransactionResolver, 
    TransactionViewResolver, 
    TransactionService, 
    TransactionViewService,
    TransactionRecoveryService
  ],
  exports: [TransactionService, TransactionViewService, TransactionRecoveryService],
})
export class TransactionModule {}
