import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { RoleController } from './controllers/role.controller';
import { RoleFx } from './entities/role-fx.entity';
import { Role } from './entities/role.entity';
import { RoleFxResolver } from './resolvers/role-fx.resolver';
import { RolesResolver } from './resolvers/roles.resolver';
import { RolesFxService } from './services/roles-fx.service';
import { RolesService } from './services/roles.service';
@Module({
  providers: [RolesResolver, RolesService, RoleFxResolver, RolesFxService],
  imports: [TypeOrmModule.forFeature([Role, RoleFx]), UsersModule, AuthModule],
  controllers: [RoleController],
})
export class RoleModule {}
