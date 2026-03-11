import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stamp } from './entity/stamp.entity';
import { StampResolver } from './resolvers/stamp.resolver';
import { StampService } from './services/stamp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stamp])],
  providers: [StampService, StampResolver],
  exports: [StampService],
})
export class StampModule {}
