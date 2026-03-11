import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { NotificationConfigService } from './services/notification-config.service';
import { NotificationConfig } from './entities/notification-config.entity';
import { NotificationConfigResolver } from './resolvers/notification-config.resolver';
import { ProfileModule } from '../../../external-api/certimails/profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationConfig]), HttpModule, ProfileModule],
  providers: [NotificationConfigService, NotificationConfigResolver],
  exports: [NotificationConfigService],
})
export class NotificationConfigModule {}
