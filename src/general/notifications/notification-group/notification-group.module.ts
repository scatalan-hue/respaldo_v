import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { NotificationGroupService } from './services/notification-group.service';
import { NotificationGroup } from './entities/notification-group.entity';
import { NotificationGroupResolver } from './resolvers/notification-group.resolver';
import { NotificationConfigModule } from '../notification-config/notification-config.module';
import { NotificationModule } from '../notification/notification.module';
import { SuscriptionModule } from '../../suscriptions/suscription.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationGroup]), HttpModule, NotificationConfigModule, NotificationModule, SuscriptionModule],
  providers: [NotificationGroupService, NotificationGroupResolver],
  exports: [NotificationGroupService],
})
export class NotificationGroupModule {}
