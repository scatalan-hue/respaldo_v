import { EventEmitter2 } from '@nestjs/event-emitter';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CreateRoleFxAndUrlsInput } from '../dto/inputs/create-and-remove-role-fx.input';
import { RoleFx } from '../entities/role-fx.entity';
import { RolesFxService } from '../services/roles-fx.service';
import { validateAndCreateRoleFx } from '../utils/role-fx.utils';

/**
 * Creates new roles with associated permissions and URLs.
 *
 * This function iterates over a list of `rolesFx` inputs, validates, and creates each role
 * with its associated permission and URLs using the `validateAndCreateRoleFx` function.
 *
 * @param {CreateRoleFxUrlInput[]} rolesFx List of inputs containing permissions and URLs to create new roles.
 * @param {string} roleId The identifier of the role to which the new rolesFx will be associated.
 * @param {IContext} context The request context, used for event handling and localization.
 * @param {EventEmitter2} eventEmitter Event emitter used to propagate events related to role creation.
 * @param {RolesFxService} rolesFxService Service for handling operations related to `RolesFx`.
 *
 * @returns {Promise<RoleFx[]>} A promise that resolves to a list of successfully created `RoleFx` objects.
 */
export const createNewRolesFxUrl = async (
  rolesFx: CreateRoleFxAndUrlsInput[],
  roleId: string,
  context: IContext,
  eventEmitter: EventEmitter2,
  rolesFxService: RolesFxService,
): Promise<RoleFx[]> => {
  const newRolesFx: RoleFx[] = [];

  for (let i = 0; i < rolesFx.length; i++) {
    const roleFx: any = rolesFx[i];

    const newRoleFx: RoleFx = await validateAndCreateRoleFx(context, eventEmitter, rolesFxService, roleFx.permission, roleId, roleFx.urls);

    if (newRoleFx) newRolesFx.push(newRoleFx);
  }
  return newRolesFx;
};
