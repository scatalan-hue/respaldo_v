import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FunctionalityKeys as FunctionalityAllKeys } from '../../../../app.functionalities';
import { handleEvent } from '../../../../common/functions/handle-event.function';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../common/i18n/functions/response';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { getOneRoleFxByEvent } from '../../../roles/role/constants/events.constants';
import { FindOneRoleFxByEventInput } from '../../../roles/role/dto/events/find-one-role-fx.event';
import { RoleFx } from '../../../roles/role/entities/role-fx.entity';
import { FunctionalitiesByRoleEventInput } from '../dto/events/functionalities-by-role.event';
import { CreateFunctionalityInput } from '../dto/inputs/create-functionality.input';
import { FunctionalityDescriptionInput } from '../dto/inputs/functionality-description.input';
import { UpdateFunctionalityInput } from '../dto/inputs/update-functionality.input';
import { Functionality } from '../entities/functionality.entity';
import { FunctionalityModel } from '../types/functionality.type';

export const serviceStructure = CrudServiceStructure({
  entityType: Functionality,
  createInputType: CreateFunctionalityInput,
  updateInputType: UpdateFunctionalityInput,
});

@Injectable()
export class FunctionalityService extends CrudServiceFrom(serviceStructure) {
  constructor(
    // private readonly filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Functionality;

  async loadEntities(context: IContext, parent: any, roleId: string, validateRole: boolean) {
    if (!parent) return;

    const parentUrl = parent.url;

    const children = await parent.children;

    if (!children.length) return;

    const validChildren = await Promise.all(
      children.map(async (child) => {
        const childUrl = child.url || parentUrl;

        if (validateRole && roleId) {
          const [functionality] = await this.eventEmitter.emitAsync('getFunctionalityByEvent', {
            context,
            options: { where: { key: child?.key } },
          });

          if (!(functionality instanceof Functionality)) return;

          const roleFxFound = await handleEvent<RoleFx, FindOneRoleFxByEventInput>(
            this.eventEmitter,
            getOneRoleFxByEvent,
            {
              context,
              options: {
                where: {
                  functionality: { id: functionality.id },
                  role: { id: roleId },
                  ...(!functionality.url ? { roleFxUrls: { functionality: { url: childUrl } } } : {}),
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

    await Promise.all(childrenFiltered.map((child) => this.loadEntities(context, child, roleId, validateRole)));
  }

  async functionalitiesDescriptionByPermission(context: IContext, functionalityDescriptionInput: FunctionalityDescriptionInput): Promise<Functionality> {
    const { key } = functionalityDescriptionInput;

    const findDescription = await this.findOneBy(context, {
      where: {
        key,
      },
    });

    if (!findDescription)
      throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'functionalitiesDescriptionByPermission.findDescription', { key }));

    return findDescription;
  }

  async synchronizeFunctionalities(context: IContext, child?: FunctionalityModel, parent?: Functionality): Promise<string> {
    const repository = this.getRepository(context);

    const keys = child || FunctionalityAllKeys;
    const { key, name, url, title, description, icon, children } = keys;

    let functionality = await this.findOneBy(context, { where: { key }, relations: ['parent'] });

    const newFunctionality = { key, name, title, description, url, icon };

    if (functionality) {
      Object.assign(functionality, newFunctionality);

      if (parent) {
        functionality.parent = functionality.parent ? [...(await Promise.resolve(functionality.parent)), parent] : [parent];
      }

      await repository.save(functionality);
    } else {
      functionality = repository.create(newFunctionality);

      if (parent) functionality.parent = [parent];

      await repository.save(functionality);
    }

    if (children?.length) {
      await Promise.all(children.map((child) => this.synchronizeFunctionalities(context, child, functionality)));
    }

    return sendResponse(context, this.I18N_SPACE, 'synchronizeFunctionalities.response');
  }

  async findAllFunctionalities(context: IContext): Promise<Functionality> {
    const functionalities = await this.findOneBy(context, {
      where: {
        key: FunctionalityAllKeys.key,
      },
    });

    await this.loadEntities(context, functionalities, null, false);

    return functionalities;
  }

  async functionalitiesByRole({ context, role }: FunctionalitiesByRoleEventInput): Promise<Functionality[]> {
    const functionalities = await this.findOneBy(context, {
      where: {
        // key: 'home' || FunctionalityAllKeys.key,
        key: 'home',
      },
    });

    const { id: roleId } = role;

    await this.loadEntities(context, functionalities, roleId, true);

    return await functionalities?.children;
  }

  async getFunctionalityBy({ context, options }: any): Promise<Functionality> {
    return await this.findOneBy(context, options);
  }

  @OnEvent('getFunctionalityByEvent')
  async onGetFunctionalityBy(input: any): Promise<Functionality> {
    return await this.getFunctionalityBy(input);
  }
}
