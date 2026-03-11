import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SiiafeApiController } from './controllers/siiafe-api.controller';
import { SiiafeManagerService } from './services/siiafe-api.manager.service';
import { SiiafeService } from './services/siiafe-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SiiafeManagerService, SiiafeService],
  controllers: [SiiafeApiController],
})
export class SiiafeApiModule {}
