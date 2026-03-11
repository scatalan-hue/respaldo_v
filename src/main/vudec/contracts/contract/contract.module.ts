import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotContractsView } from '../../lots/lot/entity/views/lot-contracts.view.entity';
import { LotContractsViewService } from '../../lots/lot/services/views/lot-contracts.view.service';
import { Taxpayer } from '../../taxpayer/entity/taxpayer.entity';
import { ContractController } from './controllers/contract.controller';
import { Contract } from './entity/contract.entity';
import { ContractStatusTotalView } from './entity/views/contract-status-total.view.entity';
import { ContractView } from './entity/views/contract.view.entity';
import { ContractResolver } from './resolvers/contract.resolver';
import { ContractStatusTotalViewResolver } from './resolvers/views/contract-status-total.view.resolver';
import { ContractViewResolver } from './resolvers/views/contract.view.resolver';
import { ContractService } from './services/contract.service';
import { ContractStatusTotalViewService } from './services/views/contract-status-total.view.service';
import { ContractViewService } from './services/views/contract.view.service';
import { ContractTransactionService } from './services/contract.transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Taxpayer, ContractView, LotContractsView, ContractStatusTotalView])],
  providers: [
    ContractService,
    ContractTransactionService,
    ContractResolver,
    ContractViewService,
    ContractViewResolver,
    LotContractsViewService,
    ContractStatusTotalViewResolver,
    ContractStatusTotalViewService,
  ],
  exports: [ContractService, ContractTransactionService, ContractViewService, ContractStatusTotalViewService],
  controllers: [ContractController],
})
export class ContractModule {}
