import { In, Raw, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { generateConsecutive } from '../../../../../common/functions';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { findLotByIdEvent, findOrCreateDailyLotEvent, findLotEvent, findOrCreateCustomLotEvent } from '../constants/lot.constants';
import { FindLotArgs } from '../dto/args/find-lot.args';
import { CreateLotInput } from '../dto/input/create-lot.input';
import { UpdateLotInput } from '../dto/input/update-lot.input';
import { Lot } from '../entity/lot.entity';
import { LotType } from '../enum/lot-type.enum';
import moment from 'moment-timezone';
import { Mutex } from 'async-mutex';

/**
 * Estructura del servicio que define los tipos de entidad y DTOs para el servicio de lotes
 */
export const serviceStructure = CrudServiceStructure({
  entityType: Lot,
  createInputType: CreateLotInput,
  updateInputType: UpdateLotInput,
  findArgsType: FindLotArgs,
});

/**
 * Servicio que maneja las operaciones CRUD y la lógica de negocio para los lotes
 * @class LotService
 * @extends {CrudServiceFrom(serviceStructure)}
 * 
 * @example
 * // Crear un lote
 * const lot = await lotService.create(context, {
 *   lotType: LotType.Custom,
 *   name: 'Lote de prueba',
 *   organizationProduct: context.organizationProduct
 * });
 */
@Injectable()
export class LotService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
    this.dailyLotMutex = new Mutex();
  }

  private readonly I18N_SPACE = I18N_SPACE.Lot;
  private dailyLotMutex = new Mutex();

  /**
   * Valida los datos de entrada antes de crear o actualizar un lote
   * @param {IContext} context - Contexto de la aplicación
   * @param {CreateLotInput} createInput - Datos del lote a validar
   * @throws {BadRequestException} Si hay errores de validación
   * 
   * @example
   * // Validar datos de entrada
   * lotService.validateInput(context, {
   *   lotType: LotType.Custom,
   *   name: 'Lote de prueba'
   * });
   */
  private validateInput(context: IContext, createInput: CreateLotInput): void {
    const { organizationProduct }: IContext = context;

    if (!organizationProduct) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'validateInput.organizationProduct'));
    }
  }

  /**
   * Busca un lote por ID o consecutivo
   * @param {IContext} context - Contexto de la aplicación
   * @param {string} id - ID del lote
   * @param {string} consecutive - Consecutivo del lote
   * @returns {Promise<Lot>} Lote encontrado
   * 
   * @example
   * // Buscar lote por ID
   * const lot = await lotService.findLot(context, 'lot123', null);
   * // Buscar lote por consecutivo
   * const lotByConsecutive = await lotService.findLot(context, null, 'LOT-001');
   */
  private async findLot(context: IContext, id: string, consecutive: string): Promise<Lot> {
    const lot = await this.findOneBy(context, {
      where: {
        ...(id && { id }),
        ...(consecutive && { consecutive }),
        organizationProduct: {
          organization: { id: context?.organization?.id },
        },
      },
    });

    return lot;
  }

  /**
   * Genera un nuevo consecutivo para el lote
   * @param {IContext} context - Contexto de la aplicación
   * @returns {Promise<string>} Nuevo consecutivo generado
   * 
   * @example
   * // Generar nuevo consecutivo
   * const consecutive = await lotService.generateConsecutive(context);
   * console.log(consecutive); // "LOT-002"
   */
  private async generateConsecutive(context: IContext): Promise<string> {
    const { organization } = context;

    const lastLot = await this.findOneBy(context, {
      where: {
        lotType: In([LotType.Custom, LotType.Daily]),
        organizationProduct: {
          organization: {
            id: organization?.id,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const newConsecutive = generateConsecutive(lastLot?.consecutive);

    return newConsecutive;
  }

  /**
   * Busca el lote diario actual
   * @param {IContext} context - Contexto de la aplicación
   * @returns {Promise<Lot>} Lote diario encontrado
   * 
   * @example
   * // Buscar lote diario
   * const dailyLot = await lotService.findDailyLot(context);
   * if (dailyLot) {
   *   console.log(dailyLot.name); // "LOTE DIARIO DE NOTIFICACIÓN 2024-03-20"
   * }
   */
  private async findDailyLot(context: IContext): Promise<Lot> {
    const { organization } = context;
    const today = moment.tz('America/Bogota').format('YYYY-MM-DD');

    return await this.findOneBy(context, {
      where: {
        createdAt: Raw((alias) => `CAST(${alias} AS DATE) = :today`, { today }),
        lotType: LotType.Daily,
        organizationProduct: {
          organization: {
            id: organization?.id,
          },
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  private async createDailyLot(context: IContext): Promise<Lot> {
    const today = moment.tz('America/Bogota').format('YYYY-MM-DD');
    const { organizationProduct } = context;

    const createInput = {
      lotType: LotType.Daily,
      name: `LOTE DIARIO DE NOTIFICACIÓN ${today}`,
      organizationProduct,
    };

    return await this.create(context, createInput);
  }

  async findOrCreateDailyLot(context: IContext): Promise<Lot> {
    return await this.dailyLotMutex.runExclusive(async () => {
      const dailyLot = await this.findDailyLot(context);
      if (dailyLot) return dailyLot;

      return await this.createDailyLot(context);
    });
  }

  async beforeCreate(context: IContext, repository: Repository<Lot>, entity: Lot, createInput: CreateLotInput): Promise<void> {
    // Se validan los campos requeridos.
    await this.validateInput(context, createInput);

    // Se crea el nuevo consecutivo
    const newConsecutive = await this.generateConsecutive(context);

    entity.consecutive = newConsecutive;
    entity.lotType = entity.lotType ?? LotType.Custom;
    entity.organizationProduct = context.organizationProduct;
  }

  @OnEvent(findLotByIdEvent, { suppressErrors: false})
  async onFindLotByIdEvent({ context, id }: { context: IContext; id: string }): Promise<Lot> {
    return await this.findOneBy(context, {
      where: {
        id,
      },
    }, true);
  }

  @OnEvent(findOrCreateDailyLotEvent)
  async onFindOrCreateDailyLotEvent({ context }: { context: IContext }): Promise<Lot> {
    return await this.findOrCreateDailyLot(context);
  }

  @OnEvent(findOrCreateCustomLotEvent)
  async onCreateCustomLotEvent({ context, name, internalId }: { context: IContext, name: string, internalId: string }): Promise<Lot> {

    const result: Lot = await this.findOneBy(context, {
      where: {
        internalId: internalId,
        organizationProduct: { 
          id: context.organizationProduct.id
        },
      },
    });
    if (result) return result;

    const resultByName: Lot = await this.findOneBy(context, {
      where: {
        name: String(name || "").trim(),
        organizationProduct: { 
          id: context.organizationProduct.id
        },
      },
    });
    if (resultByName) return resultByName;

    const createInput = {
      lotType: LotType.Custom,
      name: String(name || "").trim(),
      internalId: String(internalId || "").trim(),
      organizationProduct: context.organizationProduct,
    };

    return await this.create(context, createInput);
  }

  @OnEvent(findLotEvent)
  async onFindLotAndValidateOrganization({ context, id, consecutive }: { context: IContext; id?: string; consecutive?: string }): Promise<Lot> {
    return await this.findLot(context, id, consecutive);
  }
}
