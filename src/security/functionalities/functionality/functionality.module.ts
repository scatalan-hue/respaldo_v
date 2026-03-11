import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalityController } from './controllers/functionality.controller';
import { Functionality } from './entities/functionality.entity';
import { FunctionalityServiceEventHandler } from './events/functionality.service.event-handler';
import { FunctionalityResolver } from './resolvers/functionality.resolver';
import { FunctionalityService } from './services/functionality.service';

@Module({
  imports: [TypeOrmModule.forFeature([Functionality])],
  controllers: [FunctionalityController],
  providers: [FunctionalityResolver, FunctionalityService, FunctionalityServiceEventHandler],
})
export class FunctionalityModule {}
