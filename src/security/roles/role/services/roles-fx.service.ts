import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { getOneRoleFxByEvent } from '../constants/events.constants';
import { FindOneRoleFxByEventInput } from '../dto/events/find-one-role-fx.event';
import { CreateAndRemoveRoleFxInput } from '../dto/inputs/create-and-remove-role-fx.input';
import { RoleFx } from '../entities/role-fx.entity';
import { createNewRolesFxUrl } from '../functions/create-new-roles-fx-url.function';

export const serviceStructure = CrudServiceStructure({
  entityType: RoleFx,
});

@Injectable()
export class RolesFxService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async replaceAllRolesFx(context: IContext, { rolesFx, roleId }: CreateAndRemoveRoleFxInput): Promise<RoleFx[]> {
    const roleFxs: RoleFx[] = await this.find(context, { where: { role: { id: roleId } } });

    for (let i = 0; i < roleFxs.length; i++) {
      const roleFx: RoleFx = roleFxs[i];

      await this.hardRemove(context, roleFx?.id);
    }

    let newRolesFx: RoleFx[] = [];

    if (rolesFx.length !== 0) newRolesFx = await createNewRolesFxUrl(rolesFx, roleId, context, this.eventEmitter, this);

    return newRolesFx;
  }

  async getRoleFxBy({ context, options }: FindOneRoleFxByEventInput): Promise<RoleFx> {
    return await this.findOneBy(context, options);
  }

  @OnEvent(getOneRoleFxByEvent)
  async onGetRoleFxBy(input: FindOneRoleFxByEventInput): Promise<RoleFx> {
    return await this.getRoleFxBy(input);
  }
}
