import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from './entity/lot.entity';
import { LotResolver } from './resolvers/lot.resolver';
import { LotService } from './services/lot.services';
import { LotView } from './entity/views/lot.view.entity';
import { LotViewResolver } from './resolvers/views/lot.view.resolver';
import { LotViewService } from './services/views/lot.view.service';
import { LotContractsView } from './entity/views/lot-contracts.view.entity';
import { LotContractsViewService } from './services/views/lot-contracts.view.service';
import { LotContractsViewResolver } from './resolvers/views/lot-contracts.view.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, LotView, LotContractsView])],
  providers: [LotService, LotResolver, LotViewService, LotViewResolver, LotContractsViewService, LotContractsViewResolver],
  exports: [LotService, LotViewService, LotContractsViewService],
})
export class LotModule {}
