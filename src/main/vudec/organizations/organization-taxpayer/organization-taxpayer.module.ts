import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationTaxpayer } from './entities/organization-taxpayer.entity';
import { OrganizationTaxpayerResolver } from './resolvers/organization-taxpayer.resolver';
import { OrganizationTaxpayerService } from './services/organization-taxpayer.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationTaxpayer])],
  providers: [OrganizationTaxpayerService, OrganizationTaxpayerResolver],
  exports: [OrganizationTaxpayerService],
})
export class OrganizationTaxpayerModule {}
