import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ReplaceAllUserRolesInput } from '../dto/inputs/replace-all-user-roles';
import { UserRole } from '../entities/user-role.entity';

import { UserRolesServiceInterface } from '../interfaces/user-role.service.interface';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { handleEvent } from '../../../common/functions/handle-event.function';
import { User } from '../../users/entities/user.entity';
import { FindUserByIdEventInput } from '../../users/dto/events/find-user-by-id.event';
import { getUserByIdEvent } from '../../users/constants/events.constants';
import { Role } from '../../roles/role/entities/role.entity';
import { ValidateRoleEventInput } from '../../roles/role/dto/events/validate-role.event';
import { validateRoleEvent } from '../../roles/role/constants/events.constants';
import { sendResponse } from '../../../common/i18n/functions/response';

export const serviceStructure = CrudServiceStructure({
  entityType: UserRole,
});

@Injectable()
export class UserRolesService extends CrudServiceFrom(serviceStructure) implements UserRolesServiceInterface {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE: string = I18N_SPACE.User;

  async createUserRoles(context: IContext, userId: string, roleIds: string[]): Promise<UserRole[]> {
    const userRolesCreated: UserRole[] = [];

    const user = await handleEvent<User, FindUserByIdEventInput>(this.eventEmitter, getUserByIdEvent, { context, id: userId }, User);

    for (const roleId of roleIds) {
      const entity: UserRole = await this.findOneBy(context, { where: { user: { id: userId }, role: { id: roleId } } });

      if (!entity) {
        const role = await handleEvent<Role, ValidateRoleEventInput>(this.eventEmitter, validateRoleEvent, { context, roleId }, Role);

        if (!(role instanceof Role)) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'createUserRoles.role', { roleId }));

        const userRole: UserRole = new UserRole();

        userRole.user = user;
        userRole.role = role;

        userRolesCreated.push(await this.create(context, userRole));
      }
    }

    return userRolesCreated;
  }

  async replaceAllUserRoles(context: IContext, { userId, roleIds }: ReplaceAllUserRolesInput): Promise<UserRole[]> {
    const userRoles: UserRole[] = await this.find(context, { where: { user: { id: userId } } });

    for (let i = 0; i < userRoles.length; i++) {
      const userRole: UserRole = await userRoles[i];

      await this.hardRemove(context, userRole?.id);
    }

    let newRolesFx: UserRole[] = [];

    if (roleIds?.length !== 0) newRolesFx = await this.createUserRoles(context, userId, roleIds);

    return newRolesFx;
  }
}
