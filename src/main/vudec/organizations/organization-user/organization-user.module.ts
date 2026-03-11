import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationUserResolver } from './resolvers/organization-user.resolver';
import { OrganizationUserService } from './services/organization-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationUser])],
  providers: [OrganizationUserService, OrganizationUserResolver],
  exports: [OrganizationUserService],
})
export class OrganizationUserModule {}
