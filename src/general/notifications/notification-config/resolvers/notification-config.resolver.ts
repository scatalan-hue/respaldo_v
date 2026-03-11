import { Resolver } from '@nestjs/graphql';
import { NotificationConfig } from '../entities/notification-config.entity';
import { NotificationConfigService, serviceStructure } from '../services/notification-config.service';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { AdminOnly } from '../../../../security/auth/decorators/user-types.decorator';
import { Public } from '../../../../security/auth/decorators/public.decorator';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: NotificationConfigService,
  create: { name: 'createNotificationConfig', decorators: [AdminOnly] },
  update: { name: 'updateNotificationConfig', decorators: [AdminOnly] },
  remove: { name: 'removeNotificationConfig', decorators: [AdminOnly] },
  findOne: { name: 'notificationConfig', decorators: [Public] },
  findAll: { name: 'notificationConfigs', decorators: [Public] },
});

@Resolver(() => NotificationConfig)
export class NotificationConfigResolver extends CrudResolverFrom(resolverStructure) {}
