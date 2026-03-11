import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './services/notification.service';
import { Notification } from './entities/notification.entity';
import { NotificationResolver } from './resolvers/notification.resolver';
import { notificationProcessor } from './constants/events.constants';
import { NotificationConsumer } from './consumers/notification.consumer';
import { ProfileModule } from '../../../external-api/certimails/profile/profile.module';
import { EmailModule } from '../../../external-api/certimails/email/email.module';
import { SmsModule } from '../../../external-api/certimails/sms/sms.module';
import { UsersModule } from '../../../security/users/users.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    HttpModule,
    ProfileModule,
    EmailModule,
    SmsModule,
    UsersModule,
    BullModule.registerQueue({
      name: notificationProcessor,
    }),
  ],
  providers: [
    NotificationService,
    NotificationResolver,
    NotificationConsumer,
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        return new RedisPubSub({
          publisher: new Redis({
            host: process.env.REDIS_HOST, // Configura la dirección de tu servidor Redis
            port: Number(process.env.REDIS_PORT),
            retryStrategy: (times) => Math.min(times * 50, 2000),
          }),
          subscriber: new Redis({
            host: process.env.REDIS_HOST, // Configura la dirección de tu servidor Redis
            port: Number(process.env.REDIS_PORT),
            retryStrategy: (times) => Math.min(times * 50, 2000),
          }),
        });
      },
    },
  ],
  exports: [NotificationService, 'PUB_SUB'],
})
export class NotificationModule {}
