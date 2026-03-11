import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleEvent } from '../../../../common/functions/handle-event.function';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { getOneRoleFxByEvent } from '../../../roles/role/constants/events.constants';
import { FindOneRoleFxByEventInput } from '../../../roles/role/dto/events/find-one-role-fx.event';
import { RoleFx } from '../../../roles/role/entities/role-fx.entity';

/**
 * Recursively loads and filters child entities for a given parent entity, optionally validating against a role.
 *
 * @param {IContext} context The execution context.
 * @param {EventEmitter2} eventEmitter The event emitter used for triggering events.
 * @param {any} parent The parent entity containing children to process.
 * @param {string} roleId The ID of the role to validate against (optional).
 * @param {boolean} validateRole Whether to validate the role against the children's permissions.
 *
 * @returns {Promise<void>} Resolves when all children and their sub-entities have been processed.
 */
export const loadEntities = async (context: IContext, eventEmitter: EventEmitter2, parent: any, roleId: string, validateRole: boolean): Promise<void> => {
  if (!parent) return;

  const parentUrl = parent.url;

  const children = await parent.children;

  if (!children.length) return;

  const validChildren = await Promise.all(
    children.map(async (child) => {
      const childUrl = child.url || parentUrl;

      if (validateRole && roleId) {
        const roleFxFound = await handleEvent<RoleFx, FindOneRoleFxByEventInput>(
          eventEmitter,
          getOneRoleFxByEvent,
          {
            context,
            options: {
              where: {
                permission: child?.key,
                role: { id: roleId },
                roleFxUrls: { url: childUrl },
              },
            },
          },
          RoleFx,
        );

        if (!roleFxFound) return null;
      }

      if (!child.url) child.url = parentUrl;

      return child;
    }),
  );

  const childrenFiltered = validChildren.filter(Boolean);

  parent.children = childrenFiltered;

  await Promise.all(childrenFiltered.map((child) => loadEntities(context, eventEmitter, child, roleId, validateRole)));
};
