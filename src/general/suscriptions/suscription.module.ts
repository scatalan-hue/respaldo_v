import { Global, Module } from '@nestjs/common';
import { SuscriptionService } from './services/suscription.service';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [
    SuscriptionService,
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
  exports: [SuscriptionService, 'PUB_SUB'],
})
export class SuscriptionModule {}
