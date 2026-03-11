import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractHistory } from './entities/contract-history.entity';
import { ContractHistoryResolver } from './resolvers/contract-history.resolver';
import { ContractHistoryService } from './services/contract-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContractHistory])],
  providers: [ContractHistoryService, ContractHistoryResolver],
  exports: [ContractHistoryService],
})
export class ContractHistoryModule {}
