import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleEvent } from '../../../../common/functions/handle-event.function';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { Functionality } from '../../../functionalities/functionality/entities/functionality.entity';
import { findOrCreateUrlsEvent } from '../../role-fx-url/constants/events.constants';
import { validateRoleEvent } from '../../role/constants/events.constants';
import { ValidateRoleEventInput } from '../../role/dto/events/validate-role.event';
import { Role } from '../../role/entities/role.entity';
import { RoleFx } from '../entities/role-fx.entity';
import { RolesFxService } from '../services/roles-fx.service';

export const validateAndCreateRoleFx = async (
  context: IContext,
  eventEmitter: EventEmitter2,
  rolesFxService: RolesFxService,
  permission: string,
  roleId: string,
  urls?: string[],
): Promise<RoleFx> => {
  // const existingRoleFx: RoleFx = await rolesFxService.findOneBy(context, { where: { permission, role: { id: roleId } } });
  const existingRoleFx: RoleFx = await rolesFxService.findOneBy(context, { where: { functionality: { key: permission }, role: { id: roleId } } });

  if (existingRoleFx) return;

  const role = await handleEvent<Role, ValidateRoleEventInput>(eventEmitter, validateRoleEvent, { context, roleId }, Role);

  const [functionality] = await eventEmitter.emitAsync('getFunctionalityByEvent', {
    context,
    options: { where: { key: permission } },
  });

  if (!(role instanceof Role)) return;
  if (!(functionality instanceof Functionality)) return;

  const input = { role, functionality };

  const newRoleFx: RoleFx = await rolesFxService.create(context, input);

  if (urls && urls.length > 0 && !functionality?.url) {
    const [roleFxUrls] = await eventEmitter.emitAsync(findOrCreateUrlsEvent, { context, roleFx: newRoleFx, urls });

    newRoleFx.roleFxUrls = roleFxUrls;
  }

  return newRoleFx;
};
