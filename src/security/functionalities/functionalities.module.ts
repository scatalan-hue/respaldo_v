import { Module } from '@nestjs/common';
import { FunctionalityFxModule } from './functionality-fx/functionality-fx.module';
import { FunctionalityModule } from './functionality/functionality.module';

@Module({
  imports: [FunctionalityModule, FunctionalityFxModule],
})
export class FunctionalitiesModule {}
