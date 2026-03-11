import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taxpayer } from '../taxpayer/entity/taxpayer.entity';
import { TaxpayerContractsView } from './entity/views/taxpayer-contracts.view.entity';
import { TaxpayerView } from './entity/views/taxpayer.view.entity';
import { TaxpayerResolver } from './resolvers/taxpayer.resolver';
import { TaxpayerContractsViewResolver } from './resolvers/views/taxpayer-contracts.view.resolver';
import { TaxpayerViewResolver } from './resolvers/views/taxpayer.view.resolver';
import { TaxpayerService } from './services/taxpayer.service';
import { TaxpayerContractsViewService } from './services/views/taxpayer-contracts.view.service';
import { TaxpayerViewService } from './services/views/taxpayer.view.service';
import { TaxpayerController } from './controllers/taxpayer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Taxpayer, TaxpayerContractsView, TaxpayerView])],
  providers: [TaxpayerService, TaxpayerResolver, TaxpayerContractsViewService, TaxpayerContractsViewResolver, TaxpayerViewService, TaxpayerViewResolver],
  exports: [TaxpayerService, TaxpayerContractsViewService, TaxpayerViewService],
  controllers: [TaxpayerController],
})
export class TaxpayerModule {}
