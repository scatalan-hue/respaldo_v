import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { createUserRolesEvent, replaceAllUserRolesEvent } from "../constants/events.constants";
import { ReplaceAllUserRolesEventInput } from "../dto/events/replace-all-user-roles.input";
import { CreateUserRolesEventInput } from "../dto/events/create-user-roles.input";
import { UserRole } from "../entities/user-role.entity";
import { UserRolesService } from "../services/user-role.service";

@Injectable()
export class UserRolesServiceEventHandler extends UserRolesService {
  @OnEvent(replaceAllUserRolesEvent)
  async onReplaceAllUserRoles({ context, userId, roleIds }: ReplaceAllUserRolesEventInput): Promise<UserRole[]> {
    return await this.replaceAllUserRoles(context, { userId, roleIds });
  }

  @OnEvent(createUserRolesEvent)
  async onCreateUserRoles({ context, userId, roleIds }: CreateUserRolesEventInput): Promise<UserRole[]> {
    return await this.createUserRoles(context, userId, roleIds);
  }
}
