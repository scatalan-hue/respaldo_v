import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { User } from '../../../../../security/users/entities/user.entity';
import { findOrganizationByIdEvent } from '../../organization/constants/events.constants';
import { Organization } from '../../organization/entity/organization.entity';
import { CreateOrganizationUserInput } from '../dto/inputs/create-organization-user.input';
import { UpdateOrganizationUserInput } from '../dto/inputs/update-organization-user.input';
import { OrganizationUser } from '../entities/organization-user.entity';
import { findUserByIdEvent } from '../../../../../security/users/constants/events.constants';
import { createOrganizationUserEvent, findOrganizationUserEvent } from '../constants/events.constants';

export const serviceStructure = CrudServiceStructure({
  entityType: OrganizationUser,
  createInputType: CreateOrganizationUserInput,
  updateInputType: UpdateOrganizationUserInput,
});

@Injectable()
export class OrganizationUserService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.OrganizationUser;

  async beforeMutation(
    context: IContext,
    repository: Repository<OrganizationUser>,
    entity: OrganizationUser,
    input: CreateOrganizationUserInput | UpdateOrganizationUserInput,
    type: string,
  ): Promise<OrganizationUser> {
    const { organizationId, userId } = input;

    if (userId) {
      const [user] = await this.eventEmitter.emitAsync(findUserByIdEvent, {
        context,
        id: userId,
        orFail: false,
      });

      if (!user && !(user instanceof User))
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.user', {
            userId,
          }),
        );

      entity.user = user;
    }

    if (organizationId) {
      const [organization] = await this.eventEmitter.emitAsync(findOrganizationByIdEvent, {
        context,
        id: organizationId,
      });

      if (!organization && !(organization instanceof Organization))
        throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.organization', { organizationId }));

      entity.organization = organization;
    }

    if (type === 'create') {
      const organizationUser = await this.findOneBy(context, {
        where: {
          organization: { id: organizationId },
          user: { id: userId },
        },
      });

      if (organizationUser) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.organizationUser'));
    }

    return entity;
  }

  async beforeCreate(
    context: IContext,
    repository: Repository<OrganizationUser>,
    entity: OrganizationUser,
    createInput: CreateOrganizationUserInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput, 'create');
  }

  async beforeUpdate(
    context: IContext,
    repository: Repository<OrganizationUser>,
    entity: OrganizationUser,
    updateInput: UpdateOrganizationUserInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, updateInput, 'update');
  }

  @OnEvent(createOrganizationUserEvent)
  async onCreateOrganizationUser({ context, createInput }: { context: IContext; createInput: CreateOrganizationUserInput }): Promise<OrganizationUser> {
    return await this.create(context, createInput);
  }

  @OnEvent(findOrganizationUserEvent)
  async onFindOrganizationUser({ context, organizationId, userId }: { context: IContext; organizationId: string; userId: string }): Promise<OrganizationUser> {
    return await this.findOneBy(context, {
      where: {
        organization: { id: organizationId },
        user: { id: userId },
      },
    });
  }
}
