import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { createStampEvent, findOrCreateStampEvent, findStampEvent } from '../constants/stamp.constants';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../common/i18n/functions/response';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateStampInput } from '../dto/input/create-stamp.input';
import { UpdateStampInput } from '../dto/input/update-stamp.input';
import { FindStampArgs } from '../dto/args/find-stamp.args';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { StampStatus } from '../enum/stamp-status.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { Stamp } from '../entity/stamp.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: Stamp,
  createInputType: CreateStampInput,
  updateInputType: UpdateStampInput,
  findArgsType: FindStampArgs,
});

@Injectable()
export class StampService extends CrudServiceFrom(serviceStructure) {
  private readonly logger = new Logger(StampService.name);
  private readonly I18N_SPACE = I18N_SPACE.Stamp;

  constructor() {
    super();
  }

  async getQueryBuilder(context: IContext, args?: FindStampArgs): Promise<SelectQueryBuilder<Stamp>> {
    const qb = await super.getQueryBuilder(context, args);

    if (args?.contractId) {
      qb.leftJoinAndSelect('aa.movements', 'movement', `movement.contractId = '${args?.contractId}'`)
        .andWhere('movement.id IS NOT NULL');
    }

    return qb;
  }

  async beforeCreate(context: IContext, repository: Repository<Stamp>, entity: Stamp, createInput: CreateStampInput): Promise<void> {
    const existingStamp = await this.findOneBy(context, {
      where: { stampNumber: createInput.stampNumber },
    });

    if (existingStamp) {
      throw new BadRequestException(
        sendResponse(context, this.I18N_SPACE, 'beforeCreate.stampAlreadyExists')
      );
    }
  }

  async findOrCreate(context: IContext, createInput: CreateStampInput): Promise<Stamp> {
    const { stampNumber } = createInput;

    const existingStamp = await this.findOneBy(context, {
      where: { stampNumber },
    });

    return existingStamp || await this.create(context, createInput);
  }

  async inactivateStamp(context: IContext, id: string): Promise<Stamp> {
    const stamp = await this.findOneBy(context, {
      where: { id },
    });

    if (!stamp) {
      throw new BadRequestException('Estampilla no encontrada.');
    }

    return await this.update(context, stamp.id, {
      id: stamp.id,
      status: StampStatus.Inactive,
    });
  }

  @OnEvent(findOrCreateStampEvent)
  async onFindOrCreateStampEvent({
    context,
    createInput,
  }: {
    context: IContext;
    createInput: CreateStampInput;
  }): Promise<Stamp> {
    return await this.findOrCreate(context, createInput);
  }

  @OnEvent(findStampEvent, { suppressErrors: false })
  async onFindStampEvent({ context, stampNumber, orFail }: { context: IContext; stampNumber: string; orFail?: boolean; }): Promise<Stamp> {
    return await this.findOneBy(context, { where: { stampNumber } }, orFail);

  }

  @OnEvent(createStampEvent)
  async onCreateStampEvent({
    context,
    createStampInput,
  }: {
    context: IContext;
    createStampInput: CreateStampInput;
  }): Promise<Stamp> {
    return await this.create(context, createStampInput);
  }

  @OnEvent('findOrCreateCustomStampEvent', { suppressErrors: false })
  async onFindOrCreateCustomStampEvent({
    context,
    createInput,
  }: {
    context: IContext;
    createInput: {
      stampNumber: string;
      organizationProductId?: string;
      name?: string;
    };
  }): Promise<Stamp> {
    const { stampNumber, name } = createInput;

    // Intentar encontrar stamp existente
    try {
      const existingStamp = await this.findOneBy(context, {
        where: { stampNumber },
      });

      if (existingStamp) {
        this.logger.log(`Stamp encontrado: ${existingStamp.id}`);
        return existingStamp;
      }
    } catch (error) {
      this.logger.debug(`Stamp no existe, procede a crear uno nuevo`);
    }

    // Intentar crear nuevo stamp
    try {
      const newStamp = await this.create(context, {
        stampNumber,
        name: name || stampNumber,
      } as CreateStampInput);

      this.logger.log(`Stamp creado exitosamente: ${newStamp.id}`);
      return newStamp;
    } catch (createError) {
      this.logger.debug(`Intento de creación falló, buscando nuevamente...`);

      // Si la creación falla (posiblemente porque ya existe), buscar de nuevo
      try {
        const foundStamp = await this.findOneBy(context, {
          where: { stampNumber },
        });

        if (foundStamp) {
          this.logger.log(`Stamp encontrado en reintento: ${foundStamp.id}`);
          return foundStamp;
        }
      } catch (retryError) {
        this.logger.error(`No se pudo encontrar ni crear el stamp: ${stampNumber}`, retryError?.message);
        throw retryError;
      }

      throw createError;
    }
  }
}