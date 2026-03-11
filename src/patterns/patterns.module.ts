import { Module } from '@nestjs/common';
import { CrudPatternModule } from './crud-pattern/crud-pattern.module';

@Module({
  imports: [CrudPatternModule],
})
export class PatternsModule {}
