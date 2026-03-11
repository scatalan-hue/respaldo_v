import { Global, Module } from '@nestjs/common';
import { ProducerService } from './service/producer.service';
import { ConsumerService } from './service/consumer.service';

@Global()
@Module({
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
