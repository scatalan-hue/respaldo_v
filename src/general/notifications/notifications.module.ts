import { Module } from '@nestjs/common';
import { NotificationConfigModule } from './notification-config/notification-config.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationGroupModule } from './notification-group/notification-group.module';

@Module({
  imports: [NotificationConfigModule, NotificationGroupModule, NotificationModule],
})
export class NotificationsModule {}
