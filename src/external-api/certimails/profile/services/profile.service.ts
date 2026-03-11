import { Repository, SelectQueryBuilder } from 'typeorm';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateProfileInput } from '../dto/inputs/create-profile.input';
import { UpdateProfileInput } from '../dto/inputs/update-profile.input';
import { Profile } from '../entities/profile.entity';
import { ProfileManagerService } from './profile.manager.service';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { FindProfileArgs } from '../dto/args/find-profile.args';
import { profileDefaultEvent, profileEvent } from '../constants/events.constant';

export const serviceStructure = CrudServiceStructure({
  entityType: Profile,
  createInputType: CreateProfileInput,
  updateInputType: UpdateProfileInput,
  //findArgsType: OrganizationOnly
});

@Injectable()
export class ProfileService extends CrudServiceFrom(serviceStructure) {
  constructor(
    @Inject(ProfileManagerService)
    private readonly profileManagerService: ProfileManagerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async getQueryBuilder(context: IContext, args?: FindProfileArgs): Promise<SelectQueryBuilder<Profile>> {
    const qb = await super.getQueryBuilder(context, args);

    if (context?.organization?.id) {
      qb.innerJoin('aa.applicationOrganization', 'aor', 'aa.id = aor.profileId');
      qb.andWhere('(aor.organizationId = :organizationId)', {
        organizationId: context.organization.id,
      });
    }

    return qb;
  }

  async beforeCreate(context: IContext, repository: Repository<Profile>, entity: Profile, createInput: CreateProfileInput): Promise<void> {
    if (!createInput.externalId) {
      entity.externalId = await this.profileManagerService.createProfile(createInput);
    }

    if (createInput.default) {
      const profileDefault = await this.findOneBy(context, {
        where: {
          default: true,
        },
      });

      if (profileDefault) throw new BadRequestException('Default profile exists in the application');
    }
  }

  @OnEvent(profileEvent)
  async onProfile({ context, profileId }: { context: IContext; profileId?: string }): Promise<Profile | string> {
    if (profileId) {
      return await this.findOne(context, profileId, true);
    } else {
      return `Organization CODE and ID not found`;
    }
  }

  @OnEvent(profileDefaultEvent)
  async onProfileDefaultEvent({ context }: { context: IContext }): Promise<Profile> {
    return await this.findOneBy(context, {
      where: {
        default: true,
        deletedAt: null,
      },
    });
  }
}
