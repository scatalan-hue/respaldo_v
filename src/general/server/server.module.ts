import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { ServerService } from './service/server.service';
import { ServerResolver } from './resolver/server.resolver';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  providers: [ServerResolver, ServerService],
  exports: [ServerService],
})
export class ServerModule {}
