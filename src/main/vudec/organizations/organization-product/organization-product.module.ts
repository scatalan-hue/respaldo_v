import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationProduct } from './entities/organization-product.entity';
import { OrganizationProductResolver } from './resolvers/organization-product.resolver';
import { OrganizationProductService } from './services/organization-product.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationProduct])],
  providers: [OrganizationProductService, OrganizationProductResolver],
  exports: [OrganizationProductService],
})
export class OrganizationProductModule {}
