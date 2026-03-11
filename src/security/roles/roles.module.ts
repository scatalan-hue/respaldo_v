import { Module } from '@nestjs/common';
import { RolesFxUrlModule } from './role-fx-url/role-fx-url.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [RoleModule, RolesFxUrlModule],
})
export class RolesModule { }
