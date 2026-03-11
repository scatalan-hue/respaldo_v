import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractModule } from '../../contracts/contract/contract.module';
import { OrganizationController } from './controllers/organization.controller';
import { Organization } from './entity/organization.entity';
import { OrganizationView } from './entity/views/organization.view.entity';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { OrganizationViewResolver } from './resolvers/views/organization.view.resolver';
import { OrganizationService } from './services/organization.service';
import { OrganizationViewService } from './services/views/organization.view.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationView]), ContractModule],
  providers: [OrganizationService, OrganizationResolver, OrganizationController, OrganizationViewService, OrganizationViewResolver],
  exports: [OrganizationService, OrganizationViewService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
