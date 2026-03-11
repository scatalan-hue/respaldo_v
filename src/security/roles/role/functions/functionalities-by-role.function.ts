import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleEvent } from '../../../../common/functions/handle-event.function';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { functionalitiesByRoleEvent } from '../../../functionalities/functionality/constants/events.constants';
import { FunctionalitiesByRoleEventInput } from '../../../functionalities/functionality/dto/events/functionalities-by-role.event';
import { Functionality } from '../../../functionalities/functionality/entities/functionality.entity';
import { Role } from '../entities/role.entity';
import { RolesService } from '../services/roles.service';

/**
 * Retrieves functionalities associated with a specific role.
 *
 * This function uses the provided role or resolves a role using its `idRole` if needed.
 * It then triggers an event to fetch the functionalities associated with that role.
 *
 * @param {IContext} context The request context, used for event handling and localization.
 * @param {EventEmitter2} eventEmitter Event emitter used to propagate functionality-related events.
 * @param {RolesService} roleService Service to resolve or fetch roles.
 * @param {Role} role The role for which functionalities are being fetched. If not provided, it will be resolved using `idRole`.
 * @param {string} [idRole] The identifier of the role to fetch if the `role` object is not provided.
 *
 * @returns {Promise<Functionality[]>} A promise that resolves to an array of `Functionality` objects associated with the role.
 */
export const functionalitiesByRole = async (
  context: IContext,
  eventEmitter: EventEmitter2,
  roleService: RolesService,
  role: Role,
  idRole?: string,
): Promise<Functionality[]> => {
  if (idRole && !role) role = await roleService.findOneBy(context, { where: { id: idRole } });

  const functionalities = await handleEvent<Functionality[], FunctionalitiesByRoleEventInput>(
    eventEmitter,
    functionalitiesByRoleEvent,
    { context, role },
    Functionality,
  );

  return functionalities;
};
