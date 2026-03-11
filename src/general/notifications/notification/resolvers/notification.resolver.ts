import { Context, Int, Resolver, Subscription } from '@nestjs/graphql';
import { Notification } from '../entities/notification.entity';
import { NotificationService, serviceStructure } from '../services/notification.service';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { AdminOnly, AnyUser } from '../../../../security/auth/decorators/user-types.decorator';
import { Public } from '../../../../security/auth/decorators/public.decorator';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { SecurityAuthGuard } from 'src/security/auth/guards/auth.guard';
import { User } from 'src/security/users/entities/user.entity';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CurrentUser } from 'src/security/auth/decorators/current-user.decorator';
import { PubSub } from 'graphql-subscriptions';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: NotificationService,
  create: { name: 'createNotification', decorators: [AdminOnly] },
  update: { name: 'updateNotification', decorators: [AdminOnly] },
  remove: { name: 'removeNotification', decorators: [AdminOnly] },
  findOne: { name: 'notification', decorators: [Public] },
  findAll: { name: 'notifications', decorators: [Public] },
});

@Resolver(() => Notification)
export class NotificationResolver extends CrudResolverFrom(resolverStructure) {
  constructor(
    @Inject('PUB_SUB')
    private pubSub: PubSub,
    private notificationService: NotificationService,
  ) {
    super();
  }

  // @AnyUserGuest()
  @AnyUser()
  @UseGuards(SecurityAuthGuard)
  @Subscription(() => Int, { resolve: (value) => value })
  async notificationCountByUser(@CurrentUser() user: User, @Context() context: IContext) {
    if (!user) throw new BadRequestException('User undefined!');
    this.notificationService.notificationCountByUser(context, user.id);
    return this.pubSub.asyncIterator(user.id);
  }
}
