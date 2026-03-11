import { Global, Module } from '@nestjs/common';
import { BaseService } from './services/base.service';

@Global()
@Module({
  imports: [],
  providers: [BaseService],
  exports: [BaseService],
})
export class BaseModule {}
