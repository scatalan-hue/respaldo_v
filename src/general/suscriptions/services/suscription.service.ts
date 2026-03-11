import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GeneralSuscription } from '../dto/args/general-message.args';
import { TypeMessage } from '../enums/type-suscription.enum';

@Injectable()
export class SuscriptionService {
  constructor(@Inject('PUB_SUB') private pubSub: PubSub) {}

  public async messageSuscription(data: GeneralSuscription) {
    data.info.__typename = data.type == TypeMessage.Progress ? 'ProgressSuscription' : 'NotificationSuscription';
    await this.pubSub.publish(data.subscription, { ...data });
  }
}
