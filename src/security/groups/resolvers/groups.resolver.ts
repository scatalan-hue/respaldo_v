import { Resolver } from '@nestjs/graphql';
import { Group } from '../entities/groups.entity';
import { GroupsService, serviceStructure } from '../services/groups.service';
import { AdminOnly } from '../../auth/decorators/user-types.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CrudResolverStructure } from '../../auth/utils/crud.utils';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: GroupsService,
  create: { name: 'createGroup', decorators: [AdminOnly] },
  update: { name: 'updateGroup', decorators: [AdminOnly] },
  remove: { name: 'removeGroup', decorators: [AdminOnly] },
  findOne: { name: 'group', decorators: [Public] },
  findAll: { name: 'groups', decorators: [Public] },
});

@Resolver(() => Group)
export class GroupsResolver extends CrudResolverFrom(resolverStructure) {}
