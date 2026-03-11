import { EventEmitter2 } from '@nestjs/event-emitter';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { RoleFx } from '../entities/role-fx.entity';
import { RolesFxService } from '../services/roles-fx.service';
import { validateAndCreateRoleFx } from '../utils/role-fx.utils';

/**
 * Creates new roles with associated permissions.
 *
 * This function iterates over a list of permissions, validates, and creates each role
 * with the associated permission using the `validateAndCreateRoleFx` helper function.
 *
 * @param {string[]} permissions List of permission strings to create new roles.
 * @param {string} roleId The identifier of the role to which the new rolesFx will be associated.
 * @param {IContext} context The request context, used for event handling and localization.
 * @param {EventEmitter2} eventEmitter Event emitter used to propagate events related to role creation.
 * @param {RolesFxService} rolesFxService Service for handling operations related to `RolesFx`.
 *
 * @returns {Promise<RoleFx[]>} A promise that resolves to a list of successfully created `RoleFx` objects.
 */
export const createNewRolesFx = async (
  permissions: string[],
  roleId: string,
  context: IContext,
  eventEmitter: EventEmitter2,
  rolesFxService: RolesFxService,
): Promise<RoleFx[]> => {
  const newRolesFx: RoleFx[] = [];

  for (let i = 0; i < permissions.length; i++) {
    const permission: string = permissions[i];

    const newRoleFx: RoleFx = await validateAndCreateRoleFx(context, eventEmitter, rolesFxService, permission, roleId);

    if (newRoleFx) newRolesFx.push(newRoleFx);
  }
  return newRolesFx;
};
