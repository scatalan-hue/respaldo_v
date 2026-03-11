import { Module } from '@nestjs/common';
import { AuditHandlerModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { FunctionalitiesModule } from './functionalities/functionalities.module';
import { GroupsModule } from './groups/groups.module';
import { RolesModule } from './roles/roles.module';
import { UserKeyModule } from './user-key/user-key.module';
import { UserRoleModule } from './user-role/user-role.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, AuditHandlerModule, RolesModule, GroupsModule, FunctionalitiesModule, UserKeyModule, UserRoleModule],
})
export class SecurityModule {}
