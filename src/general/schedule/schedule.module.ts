import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleResolver } from './resolvers/schedule.resolver';
import { DynamicScheduleService } from './services/dynamic-schedule.service';
import { ScheduleService } from './services/schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule]), NestScheduleModule.forRoot()],
  providers: [ScheduleResolver, ScheduleService, DynamicScheduleService],
})
export class ScheduleModule {}
