import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { ProfileModule } from './profile/profile.module';
import { WssModule } from './wss/wss.module';

@Module({
  imports: [EmailModule, SmsModule, WssModule, ProfileModule],
})
export class CertimailsModule {}
