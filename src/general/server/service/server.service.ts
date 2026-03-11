import { BadRequestException, Injectable } from '@nestjs/common';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CreateServerInput } from '../dto/inputs/create-server.input';
import { UpdateServerInput } from '../dto/inputs/update-server.input';
import { Server } from '../entities/server.entity';
import { ServerModel } from '../dto/models/server-configuration.model';
import { serverModelEvent } from '../constants/event.constant';
import { OnEvent } from '@nestjs/event-emitter';

export const serviceStructure = CrudServiceStructure({
  entityType: Server,
  createInputType: CreateServerInput,
  updateInputType: UpdateServerInput,
});

@Injectable()
export class ServerService extends CrudServiceFrom(serviceStructure) {
  @OnEvent(serverModelEvent)
  public async findModel({ context, code }: { context: IContext; code: string }): Promise<ServerModel> {
    const repository = this.getRepository(context);
    const server = await repository.findOneBy({ code });

    if (!server) throw new BadRequestException(`Server ${code} not found`);

    const model = new ServerModel();
    model.host = server.host;
    model.port = server.port;
    model.secure = server.secure;
    model.url = server.url;

    return model;
  }
}
