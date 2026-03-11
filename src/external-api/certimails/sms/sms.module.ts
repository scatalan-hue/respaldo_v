import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SmsManagerService } from './service/sms.manager.service';
import { SmsService } from './service/sms.service';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule, HttpModule],
  providers: [SmsService, SmsManagerService],
  exports: [SmsService],
})
export class SmsModule {}
