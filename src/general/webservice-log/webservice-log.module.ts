import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebserviceLogService } from './services/webservice-log.service';
import { WebserviceLog } from './entities/webservice-log.entity';
import { WebserviceLogResolver } from './resolver/webservice-log.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([WebserviceLog]), HttpModule],
  providers: [WebserviceLogService, WebserviceLogResolver],
  exports: [WebserviceLogService],
})
export class WebserviceLogModule {}