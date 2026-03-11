import { Module } from '@nestjs/common';
import { CertimailsModule } from './certimails/certimails.module';
import { KafkaModule } from './kafka/kafka.module';
import { SigecModule } from './sigec/sigec.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [CertimailsModule, IntegrationModule, SigecModule, process.env.KAFKA === 'true' ? KafkaModule : null].filter(Boolean),
})
export class ExternalApiModule {}
