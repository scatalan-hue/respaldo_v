import { Module } from '@nestjs/common';
import { SigecService } from './services/sigec.service';
import { SigecManager } from './services/sigec.manager.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SigecService, SigecManager],
})
export class SigecModule {}
