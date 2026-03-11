import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Group } from './entities/groups.entity';
import { GroupsService } from './services/groups.service';
import { GroupsResolver } from './resolvers/groups.resolver';
import { NotificationConfigModule } from '../../general/notifications/notification-config/notification-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), HttpModule, NotificationConfigModule],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService],
})
export class GroupsModule {}
