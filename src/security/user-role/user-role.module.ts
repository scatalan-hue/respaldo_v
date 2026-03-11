import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRole } from "./entities/user-role.entity";
import { UserRolesService } from "./services/user-role.service";
import { UserRolesServiceEventHandler } from "./events/user-role.service.event-handler";

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  providers: [UserRolesService, UserRolesServiceEventHandler]
})
export class UserRoleModule {}
