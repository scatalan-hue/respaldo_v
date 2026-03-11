import { Module } from '@nestjs/common';
import { VudecModule } from './vudec/vudec.module';
import { SiiafeApiModule } from 'src/external-api/siiafe/siiafe-api.module';

@Module({
  imports: [VudecModule, SiiafeApiModule],
})
export class MainModule {}
