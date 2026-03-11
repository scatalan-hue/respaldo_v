import { Job } from 'bull';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { createNotificationGroupQueue, notificationGroupProcessor } from '../constants/events.constants';
import { NotificationGroupService } from '../services/notification-group.service';
import { SuscriptionService } from '../../../suscriptions/services/suscription.service';
import { TypeMessage, TypeSuscription } from '../../../suscriptions/enums/type-suscription.enum';
import { GeneralSuscription } from '../../../suscriptions/dto/args/general-message.args';

@Processor(notificationGroupProcessor)
export class NotificationGroupConsumer {
  constructor(
    private readonly notificationGroupService: NotificationGroupService,
    private readonly suscriptionService: SuscriptionService,
  ) {}

  @OnQueueActive()
  async onActive(job: Job) {
    await this.suscriptionService.messageSuscription({
      id: job.data.lote.id,
      subscription: 'NotificationGroupSuscription',
      type: TypeMessage.Notification,
      info: {
        title: 'Iniciando proceso de inserción',
        description: 'Iniciando proceso de inserción lote',
        type: TypeSuscription.startProcess,
      },
    } as GeneralSuscription);
  }

  @Process(createNotificationGroupQueue)
  async createNotificationGroup(job: Job) {
    await new Promise(async (resolve, reject) => {
      try {
        await this.notificationGroupService.fillGroup({ user: job.data.user }, job.data.entity, job.data.createInput);
        resolve('Data processed');
      } catch (error) {
        reject(error);
      }
    });
    return { done: true };
  }
}
