import { Resolver } from '@nestjs/graphql';
import { NotificationGroup } from '../entities/notification-group.entity';
import { NotificationGroupService, serviceStructure } from '../services/notification-group.service';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { AdminOnly } from '../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: NotificationGroupService,
  create: { name: 'createNotificationGroup', decorators: [AdminOnly] },
  findOne: { name: 'NotificationGroup', decorators: [AdminOnly] },
  findAll: { name: 'NotificationGroups', decorators: [AdminOnly] },
});

@Resolver(() => NotificationGroup)
export class NotificationGroupResolver extends CrudResolverFrom(resolverStructure) {}
