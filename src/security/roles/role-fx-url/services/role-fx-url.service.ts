import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { RoleFx } from '../../role/entities/role-fx.entity';
import { findOrCreateUrlsEvent } from '../constants/events.constants';
import { RoleFxUrl } from '../entities/role-fx-url.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: RoleFxUrl,
});

@Injectable()
export class RoleFxUrlService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async findOrCreateUrls(context: IContext, roleFx: RoleFx, urls: string[]): Promise<RoleFxUrl[]> {
    const existingUrls = [];

    for (const url of urls) {
      const [functionality] = await this.eventEmitter.emitAsync('getFunctionalityByEvent', {
        context,
        options: { where: { url } },
      });

      const newUrl = await this.create(context, { functionality, roleFx });

      existingUrls.push(newUrl);
    }

    return existingUrls;
  }

  @OnEvent(findOrCreateUrlsEvent)
  async onFindOrCreateUrlsEvent({ context, roleFx, urls }: { context: IContext; roleFx: RoleFx; urls: string[] }): Promise<RoleFxUrl[]> {
    return await this.findOrCreateUrls(context, roleFx, urls);
  }
}
