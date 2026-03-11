import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WssManagerService } from './service/wss.manager.service';
import { WssService } from './service/wss.service';
import { ProfileModule } from '../profile/profile.module';

@Global()
@Module({
  imports: [ProfileModule, HttpModule],
  providers: [WssService, WssManagerService],
  exports: [WssService],
})
export class WssModule {}
