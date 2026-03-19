import { IsNull, Not, Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import { omit, uniq } from 'lodash';
import { formatPrice } from '../../../../common/functions';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../common/i18n/functions/response';
import { IDictionary } from '../../../../common/interfaces/dictionary.interface';
import { EmailRecipient } from '../../../../external-api/certimails/email/dto/args/email.args';
import { RecipientType } from '../../../../external-api/certimails/email/interface/email.enum';
import { profileDefaultEvent } from '../../../../external-api/certimails/profile/constants/events.constant';
import { RegisterLiquidationRequest, RegisterPaymentRequest, ReportContractRequest } from '../../../../external-api/sigec/dto/sigec.request.dto';
import { RegisterLiquidationResponse, RegisterPaymentResponse, ReportContractResponse } from '../../../../external-api/sigec/dto/sigec.response.dto';
import { SigecEvents } from '../../../../external-api/sigec/enums/sigec-events-type.enum';
import { NotificationSubtypesE } from '../../../../general/notifications/notification-config/enums/notification-subtype.enum';
import { NotificationTypes } from '../../../../general/notifications/notification-config/enums/notification-type.enum';
import { createNotificationEvent } from '../../../../general/notifications/notification/constants/events.constants';
import { TypeNotification } from '../../../../general/notifications/notification/enums/type-notification.enum';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { getTokenAuthEvent } from '../../../../security/auth/constants/events.constants';
import { findUserByEvent } from '../../../../security/users/constants/events.constants';
import { User } from '../../../../security/users/entities/user.entity';
import { UserTypes } from '../../../../security/users/enums/user-type.enum';
import { findContractByIdEvent } from '../../contracts/contract/constants/events.constants';
import { Contract } from '../../contracts/contract/entity/contract.entity';
import { findLotByIdEvent } from '../../lots/lot/constants/lot.constants';
import { Lot } from '../../lots/lot/entity/lot.entity';
import { findOrCreateStampEvent, findStampEvent } from '../../stamp/constants/stamp.constants';
import { Stamp } from '../../stamp/entity/stamp.entity';
import { Taxpayer } from '../../taxpayer/entity/taxpayer.entity';
import { TypeDoc } from '../../taxpayer/enums/taxpayer-type.enum';
import { createMovementEvent, createMovementsEvent, findMovementById, handleUnsentMovementsEvent, isValidMovementsEvent, sendMovementsToSigecEvent, updateMovementsEvent } from '../constants/events.constants';
import { FindMovementArgs } from '../dto/args/find-movement.args';
import { CreateMovementInput } from '../dto/inputs/create-movement.input';
import { UpdateMovementInput } from '../dto/inputs/update-movement.input';
import { RequestCreateMovement } from '../dto/models/request-create-movement.model';
import { Movement } from '../entity/movement.entity';
import { MovementLatestView } from '../entity/views/movement-latest.view.entity';
import { MovementStatus } from '../enums/movement-status.enum';
import { TypeMovement } from '../enums/movement-type.enum';
import { MovementLatestViewService } from './views/movement-latest.view.service';
import { MovementRegisterType } from '../enums/movement-register-type.enum';
import { CreateContractInput } from '../../contracts/contract/dto/inputs/create-contract.input';
import { hardRemoveLotContractEvent } from '../../lots/lot-contract/constants/events.constants';

dotenv.config({ path: './.env' });

export const serviceStructure = CrudServiceStructure({
  entityType: Movement,
  createInputType: CreateMovementInput,
  updateInputType: UpdateMovementInput,
  findArgsType: FindMovementArgs,
});

@Injectable()
export class MovementService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly movementLatestViewService: MovementLatestViewService,
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Movement;

  private validateInput(context: IContext, createInput: CreateMovementInput): void {
    const { lotId, contractId, stampInput }: CreateMovementInput = createInput;

    if (!lotId) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'validateInput.lotId'));
    }

    if (!contractId) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'validateInput.contractId'));
    }

    if (!stampInput) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'validateInput.stampInput'));
    }
  }

  async beforeCreate(context: IContext, repository: Repository<Movement>, entity: Movement, createInput: CreateMovementInput): Promise<void> {
    const { lotId, contractId, stampInput } = createInput;

    await this.validateInput(context, createInput);

    //Contract
    const [contract] = await this.eventEmitter.emitAsync(findContractByIdEvent, {
      context,
      id: contractId,
    });

    if (!contract && !(contract instanceof Contract))
      throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.contract'));
    entity.contract = contract;

    //Lot
    const [lot] = await this.eventEmitter.emitAsync(findLotByIdEvent, {
      context,
      id: lotId,
    });

    if (!lot && !(lot instanceof Lot))
      throw new NotFoundException(
        sendResponse(context, this.I18N_SPACE, 'beforeMutation.lot', {
          lotId,
        }),
      );

    entity.lot = lot;

    const [stamp] = await this.eventEmitter.emitAsync(findStampEvent, {
      context,
      stampNumber: stampInput.stampNumber,
      orFail: true
    });

    if (!stamp || !(stamp instanceof Stamp) || !stamp?.id) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeCreate.stamp'));
    }

    entity.organizationProduct = context.organizationProduct;
    entity.stamp = stamp;
    entity.status = !createInput.status || createInput.status.toString() == '' ? MovementStatus.Unsent : createInput.status;
    entity.expenditureNumber =
      !createInput.expenditureNumber || createInput.expenditureNumber.toString() == '' ? null : createInput.expenditureNumber.toString().replace(/ /g, '');
    entity.movId = !createInput.movId || createInput.movId.toString() == '' ? null : createInput.movId.toString().replace(/ /g, '');

    //Movement duplicated with autoincremental logic
    let increment = 0;
    let newMovId = entity.movId;
    let movementDuplicated;

    do {
      movementDuplicated = await this.findOneBy(context, {
        where: {
          movId: newMovId,
          expenditureNumber: entity.expenditureNumber,
          type: entity.type,
          contract: { id: contractId },
          isRevert: false,
          group: entity.group
        },
      });

      if (movementDuplicated) {
        const movementRevert = await movementDuplicated.movementRevert;

        if (movementDuplicated.isRevert === false && entity.isRevert) {
          createInput.movementRevertId = movementDuplicated.id;
          break;
        } else if (movementDuplicated.isRevert === false && !entity.isRevert && !movementRevert?.id) {
          throw new Error(`Movement with movId ${newMovId} already exists and is not reverted`);
        } else if (movementDuplicated.isRevert === true || movementRevert?.id) {
          increment++;
          newMovId = entity.movId + increment.toString();
        }
      }
    } while (movementDuplicated);

    entity.movId = newMovId;

    if (entity.type == TypeMovement.Apply) {
      entity.associatedMovement = newMovId.replace('APPLY', 'ADHESION');;
    }

    if (entity.isRevert) entity.movementRevertId = undefined;

  }

  async afterCreate(context: IContext, repository: Repository<Movement>, entity: Movement, createInput: CreateMovementInput): Promise<void> {
    //Movement Revert
    if (createInput.movementRevertId) {
      await this.update(context, createInput.movementRevertId, { id: createInput.movementRevertId, movementRevertId: entity.id });
    }
  }

  /**
   * Crea múltiples movimientos
   * @param {IContext} context - Contexto de la aplicación
   * @param {RequestCreateMovement[]} movementsInput - Lista de movimientos a crear
   * @returns {Promise<Movement[]>} Lista de movimientos creados
   *
   * @example
   * // Crear múltiples movimientos
   * const movements = await movementService.createMovements(context, [
   *   {
   *     lotId: '123',
   *     contractId: '456',
   *     stampInput: { stampNumber: '789' },
   *     type: TypeMovement.Register,
   *     value: 1000
   *   },
   *   {
   *     lotId: '123',
   *     contractId: '456',
   *     stampInput: { stampNumber: '790' },
   *     type: TypeMovement.Adhesion,
   *     value: 500
   *   }
   * ]);
   */
  async createMovements(context: IContext, movementsInput: RequestCreateMovement[], contract: Contract, createContractInput: CreateContractInput): Promise<Movement[]> {
    const movements: Movement[] = [];

    for (const currentMovement of movementsInput) {
      try {
        const movementCreated: Movement = await this.createMovement(context, currentMovement, contract, createContractInput);
        if (movementCreated) movements.push(movementCreated);
      } catch (error) {
        throw error;
      }
    }

    return movements;
  }

  async createMovement(context: IContext, movement: RequestCreateMovement, contract: Contract, createContractInput: CreateContractInput): Promise<Movement> {
    let movementCreated: Movement | undefined;

    if (movement.isRevert && movement.movId) return await this.handleRevertMovement(context, movement);

    movement.group = (createContractInput.contractType == undefined || createContractInput.contractType.toString() == '0') ? TypeMovement.Register : createContractInput.contractType as TypeMovement;

    switch (movement.type) {
      case TypeMovement.Register:
        movementCreated = await this.handleCreateRegisterMovement(context, movement.type, movement);
        break;
      case TypeMovement.Amendment:
        const total = createContractInput.contractValue - contract.contractValue;

        movement.description = `Valor agregado: ${formatPrice(total)}`;
        movementCreated = await this.handleCreateRegisterMovement(context, movement.type, movement);
        break;
      case TypeMovement.Assignment:

        const contractTaxpayer = await Promise.resolve(contract?.taxpayer);

        movement.description = `Tercero anterior: ${contractTaxpayer?.name} ${contractTaxpayer?.lastName}~Cedido al tercero: ${createContractInput.taxpayerInput?.name} ${createContractInput.taxpayerInput?.lastName}`;
        movementCreated = await this.handleCreateRegisterMovement(context, movement.type, movement);
        break;
      default:
        movementCreated = await this.create(context, movement);
        break;
    }

    return movementCreated;
  }

  private async handleCreateRegisterMovement(context: IContext, type: TypeMovement, movement: RequestCreateMovement): Promise<Movement> {
    const existingMovement = await this.findOneBy(context, {
      where: {
        contract: { id: movement.contractId },
        type: type,
        deletedAt: null,
        taxpayer: { id: movement.taxpayerId },
      },
    });

    return existingMovement ?? this.create(context, movement);
  }

  private async handleRevertMovement(context: IContext, movement: RequestCreateMovement): Promise<Movement> {
    const movementValidToRevert = await this.movementLatestViewService.findOneBy(context, {
      where: {
        movId: movement.movId,
        expenditureNumber: movement.expenditureNumber,
        type: movement.type,
        isRevert: false,
        isLatest: true,
        contractId: movement.contractId
      },
    });

    if (movementValidToRevert)
      switch (movementValidToRevert.status) {
        case MovementStatus.Unsent:
          await this.hardRemove(context, movementValidToRevert.id);
          break;
        default:
          return await this.createRevertMovement(context, movementValidToRevert);
      }
  }

  private async createRevertMovement(context: IContext, movementValidToRevert: MovementLatestView): Promise<Movement> {
    const movement = {
      ...movementValidToRevert,
      ...(movementValidToRevert.type === TypeMovement.Adhesion && { liquidatedValue: movementValidToRevert.liquidatedValue, paidValue: 0 }),
      ...(movementValidToRevert.type === TypeMovement.Apply && { paidValue: movementValidToRevert.paidValue, liquidatedValue: 0 }),
      expenditureNumber: movementValidToRevert.expenditureNumber,
      stampInput: { stampNumber: movementValidToRevert?.stampNumber },
      isRevert: true,
      value: 0,
      status: MovementStatus.Unsent,
      movementRevertId: movementValidToRevert.id,
      taxpayerId: movementValidToRevert.taxpayerId
    };

    return await this.create(context, omit(movement, ['id']));
  }

  private async checkMovement(context: IContext, movementInput: RequestCreateMovement, movementsInput: RequestCreateMovement[]): Promise<boolean> {
    const { contractId, expenditureNumber, type, isRevert } = movementInput;

    // Validacion de movimiento de registro
    if (type === TypeMovement.Register) {
      let existingRegisterMovement = await this.findOneBy(context, {
        where: {
          contract: { id: contractId },
          type,
          deletedAt: IsNull(),
          organizationProductId: context.organizationProduct?.id
        },
      });
      if (existingRegisterMovement) return false;
    }

    // Validacion de movimientos generales
    if (expenditureNumber && !isRevert) {

      let existingSentMovements = await this.findOneBy(context, {
        where: {
          expenditureNumber,
          contract: { id: contractId },
          type,
          deletedAt: null,
          isRevert: false,
          movementRevert: { id: IsNull() }
        },
      });

      if (existingSentMovements) {

        const stamp = await Promise.resolve(existingSentMovements.stamp);

        existingSentMovements.createdAt = undefined;
        existingSentMovements.updatedAt = undefined;

        const revertMovement: CreateMovementInput = {
          ...existingSentMovements,
          isRevert: true,
          date: new Date(),
          value: existingSentMovements.value,
          status: MovementStatus.Unsent,
          contractId: contractId,
          organizationProductId: context.organizationProduct?.id,
          documentId: (await existingSentMovements.document)?.id,
          description: `Reversión de ${existingSentMovements.description}`,
          movementRevertId: (await existingSentMovements.movementRevert)?.id,
          taxpayerId: (await existingSentMovements.taxpayer)?.id,
          stampInput: {
            stampNumber: stamp?.stampNumber,
            name: stamp?.name
          }
        };
        revertMovement["id"] = undefined;

        await this.create(context, revertMovement);

      }
    }

    // Luego continuar con la validación normal
    const relatedMovements = this.getRelatedMovements(movementInput, movementsInput);

    if (isRevert) {
      return await this.validateRevertMovement(context, movementInput);
    }

    return await this.validateMovement(context, movementInput, relatedMovements);
  }

  private getRelatedMovements(movementInput: RequestCreateMovement, movementsInput: RequestCreateMovement[]): RequestCreateMovement[] {
    const { movId, expenditureNumber, type, contractId } = movementInput;

    return movementsInput.filter((m) => m.movId === movId && m.expenditureNumber === expenditureNumber && m.type === type && m.contractId === contractId);
  }

  async validateRevertMovement(context: IContext, movementInput: RequestCreateMovement): Promise<boolean> {
    const { contractId } = movementInput;
    let increment = 0;
    let currentMovId = movementInput.movId;
    let isValidRevert = null;

    do {
      const whereClause = {
        ...this.buildBaseWhereClause({
          ...movementInput,
          movId: currentMovId
        }),
        contractId,
      };

      isValidRevert = await this.movementLatestViewService.findOneBy(context, {
        where: whereClause,
      });

      if (isValidRevert) {
        if (isValidRevert.isRevert === false && isValidRevert.isLatest === true) {
          movementInput.movId = currentMovId;
          return true;
        } else if (isValidRevert.isRevert === true) {
          increment++;
          currentMovId = movementInput.movId + increment.toString();
        } else if (isValidRevert.isRevert === false && isValidRevert.isLatest === false) {
          increment++;
          currentMovId = movementInput.movId + increment.toString();
        }
      } else {
        return false;
      }

    } while (isValidRevert);

    // No se encontró ningún registro válido para revertir
    return false;
  }

  private async validateMovement(context: IContext, movementInput: RequestCreateMovement, relatedMovements: RequestCreateMovement[]): Promise<boolean> {
    const { contractId, movId } = movementInput;

    const existingMovement = await this.findOneBy(context, {
      where: {
        ...this.buildBaseWhereClause(movementInput),
        contract: { id: contractId },
      },
    });

    if (existingMovement) {
      const hasPendingRevertInPayload = relatedMovements.some((m) => m.isRevert && m.movId === movId);

      if (hasPendingRevertInPayload) {
        return true;
      }

      const isValidMovementToCreate = await this.movementLatestViewService.findOneBy(context, {
        where: {
          ...this.buildBaseWhereClause(movementInput),
          isRevert: true,
          isLatest: true,
          contractId,
        },
      });

      if (isValidMovementToCreate) return true;
    }

    return true;
  }

  private async handleUnsentMovements(context: IContext, expenditureNumber: string, contractId: string, contractType: TypeMovement, isRevert?: boolean): Promise<void> {
    let unsentMovements: Movement[] = [];

    unsentMovements = await this.find(context, {
      where: {
        expenditureNumber,
        status: Not(MovementStatus.Send),
        contract: { id: contractId },
        isRevert: false,
        group: contractType
      },
    });

    for (const movement of unsentMovements) {
      if (movement.status === MovementStatus.Unsent) {
        await this.hardRemove(context, movement.id);
      } else if (movement.status === MovementStatus.Error) {
        await this.remove(context, movement.id);
      }
    }

    const registerMovement = await this.find(context, {
      where: {
        status: MovementStatus.Unsent,
        contract: { id: contractId }
      },
    });

    //Si solo queda el movimiento de registro y es un revert se elimina tambien
    if (registerMovement.length === 1 && registerMovement[0].type === TypeMovement.Register && isRevert) {
      await this.hardRemove(context, registerMovement[0].id);
      await this.eventEmitter.emitAsync(hardRemoveLotContractEvent, {
        context,
        contractId: registerMovement[0].contractId,
        lotId: registerMovement[0].lotId
      }) as RegisterLiquidationResponse[];

    }
  }

  private buildBaseWhereClause(movementInput: RequestCreateMovement) {
    const { movId, expenditureNumber, type } = movementInput;

    return {
      movId,
      expenditureNumber,
      type,
    };
  }

  async sendMovementsToSigec(context: IContext, contractId: string, lotId?: string): Promise<string> {

    const [lot] = await this.eventEmitter.emitAsync(findLotByIdEvent, {
      context,
      id: lotId,
    }) as [Lot];

    const organizationProduct = await Promise.resolve(lot.organizationProduct);
    const organization = await Promise.resolve(organizationProduct?.organization);

    if (!organization?.token) {
      throw new BadRequestException('La organización o entidad descentralizada no tiene un token Sigec configurado.');
    }

    const movements = await this.find(context, {
      where: {
        ...(lotId && { lot: { id: lotId } }),
        contract: { id: contractId },
        status: Not(MovementStatus.Send),
        deletedAt: null,
      },
    });

    if (!movements || movements.length === 0) {
      throw new BadRequestException('Movimientos no encontrados.');
    }

    const movementsSent = [];

    const movementsSorted = await this.sortMovements(context, movements);

    for (const movement of movementsSorted) {
      const movementSent = await this.sendMovementSigec(context, movement?.id, organization?.token);

      if (movementSent) movementsSent.push(movementSent);
    }

    const [contract] = await this.eventEmitter.emitAsync(findContractByIdEvent, { context, id: contractId });

    const taxpayer = await Promise.resolve(contract?.taxpayer);

    const [user] = await this.eventEmitter.emitAsync(findUserByEvent, {
      context,
      options: {
        where: {
          email: taxpayer?.email,
          identificationNumber: taxpayer?.taxpayerNumber,
          type: UserTypes.Public,
        },
      },
    });

    if (user) {
      const movementsToNotify = movementsSent.filter((m) => m.isRevert === false && m.status === MovementStatus.Send);

      const expenditureNumbers = uniq(movementsToNotify.filter((item) => !!item.expenditureNumber).map((item) => item?.expenditureNumber));

      for (const expenditureNumber of expenditureNumbers) {
        const movementsByExpenditure = movementsToNotify.filter((m) => m?.expenditureNumber === expenditureNumber);

        if (movementsByExpenditure.length > 0) this.notifyMovement(context, movementsByExpenditure, contract, taxpayer, user);
      }
    }

    return 'Movimientos enviados';
  }

  async notifyMovement(context: IContext, movements: Movement[], contract: Contract, taxpayer: Taxpayer, user: User): Promise<void> {
    let paidDetails = '';

    const movementsToNotify = movements?.filter((movement) => movement?.type === TypeMovement.Apply);

    if ((movementsToNotify || [])?.length === 0) return;

    for (const movement of movementsToNotify) {
      const stamp = await Promise.resolve(movement?.stamp);

      const liquidatedMovement = await movements.find((adhMovement) => adhMovement?.movId === movement?.associatedMovement);

      // Usar estilos inline completos para garantizar compatibilidad con clientes de correo al reenviar
      paidDetails += `<tr style="background-color: #ffffff;">
        <td style="text-align: left; font-size: 14px; border: 1px solid #ccc; padding: 10px; color: #4d4d4d; font-weight: bold; font-family: 'Trebuchet MS', Arial, sans-serif; width: 60%; background-color: #ffffff; word-break: break-word; white-space: normal;">${stamp?.name || ''
        }</td>
        <td style="text-align: left; font-size: 14px; border: 1px solid #ccc; padding: 10px; color: #4d4d4d; font-weight: bold; font-family: 'Trebuchet MS', Arial, sans-serif; width: 20%; background-color: #ffffff;">${formatPrice(liquidatedMovement?.liquidatedValue) || '0'
        }</td>
        <td style="text-align: left; font-size: 14px; border: 1px solid #ccc; padding: 10px; color: #4d4d4d; font-weight: bold; font-family: 'Trebuchet MS', Arial, sans-serif; width: 20%; background-color: #ffffff;">${formatPrice(movement?.paidValue) || '0'
        }</td>
      </tr>`;
    }

    const dictionary: IDictionary = {};

    const organizationProduct = await Promise?.resolve(contract?.organizationProduct);

    if (!organizationProduct) return;

    let profile = await Promise?.resolve(organizationProduct?.profile);

    if (!profile) {
      const [defaultProfile] = await this.eventEmitter.emitAsync(profileDefaultEvent, {
        context,
      });

      profile = await Promise?.resolve(defaultProfile);
    }

    if (!profile) return;

    const organization = await Promise?.resolve(organizationProduct?.organization);
    const product = await Promise?.resolve(organizationProduct?.product);
    const department = await Promise?.resolve(organization?.department);
    const logo = await Promise?.resolve(organization?.logo);

    const [userKey] = await this.eventEmitter.emitAsync(getTokenAuthEvent, {
      context: { user, organization, product, organizationProduct },
      userIn: user,
      userInput: {},
      args: { taxpayerId: taxpayer?.id },
      expirable: false,
    });

    dictionary['ORGANIZATIONNAME'] = `${process.env.APP_URL}:${process.env.APP_PORT}/attachment/files/static/${logo?.id}.${logo?.fileExtension}`;
    dictionary['ENTNAME'] = organization?.name;
    dictionary['DEPNAME'] = department?.name;
    dictionary['BENNAME'] = `${taxpayer?.name ?? ''} ${taxpayer?.lastName ?? ''}`;
    dictionary['CONTRACTNUM'] = contract?.consecutive;
    dictionary['CONTRACTVALUE'] = formatPrice(contract?.contractValue);
    dictionary['PAYMTDATE'] = movementsToNotify?.[0]?.date;
    dictionary['PAYMTREF'] = movementsToNotify?.[0]?.expenditureNumber;
    dictionary['PAYMTVALUE'] = formatPrice(movementsToNotify?.reduce((acc, curr) => acc + curr?.paidValue, 0) || 0);
    dictionary['EMAIL'] = organization?.email;
    dictionary['DETAILS'] = paidDetails;
    dictionary['PAYMTSTATE'] = 'ENVIADO';
    dictionary['ADDRESS'] = organization?.address;
    dictionary['OFFICEHOURS'] = organization?.schedule;
    dictionary['PHONE'] = organization?.phone;
    dictionary['URL'] = `${process.env.APP_FRONT_URL}/externalauth/${userKey}?redirectTo=publicMovements&contractId=${contract?.id}`;

    const recipients: EmailRecipient[] = [
      {
        email: taxpayer?.email,
        type: RecipientType.Destinatary,
        aditionalInfo: {
          name: taxpayer?.name,
          lastName: taxpayer?.lastName,
          phone: taxpayer?.phone,
        },
      },
    ];

    await this.eventEmitter.emitAsync(createNotificationEvent, {
      context,
      input: {
        userId: user?.id,
        profileId: profile?.id,
        metadata: JSON.stringify(dictionary),
        type: TypeNotification.Email,
        emailRecipients: recipients,
        typeConfig: NotificationTypes.General,
        subtypeConfig: NotificationSubtypesE.notifyStamps,
        subject: 'Notificación de Estampillas Contractuales',
      },
    });
  }

  private formatDateWithHour(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }

  private formatDateOnlyDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  private async validateMovementDependencies(
    context: IContext,
    movId: string,
  ): Promise<{
    movement: Movement;
    contract: Contract;
    taxpayer: Taxpayer;
    stamp: Stamp;
  }> {
    const movement = await this.findOneBy(context, {
      where: { id: movId, status: Not(MovementStatus.Send) },
      relations: ['contract', 'contract.taxpayer'],
    });

    if (!movement) {
      throw new BadRequestException('Movimiento no enviado no encontrado');
    }

    const contract = await Promise.resolve(movement.contract);
    if (!contract) {
      throw new BadRequestException('Movimiento sin contrato');
    }

    const taxpayer = await Promise.resolve(movement.taxpayer);
    if (!taxpayer) {
      throw new BadRequestException('Movimiento sin tercero asociado');
    }

    const stamp = await Promise.resolve(movement.stamp);
    if (!stamp) {
      throw new BadRequestException('Movimiento sin estampilla');
    }

    return { movement, contract, taxpayer, stamp };
  }

  private mapDocumentTypeToSigecCode(docType: TypeDoc | string): string {
    if (!docType) return 'CC';

    const documentTypeMap: Record<string, string> = {
      [TypeDoc.CC]: 'CC',
      [TypeDoc.NIT]: 'NIT',
      [TypeDoc.TI]: 'TI',
      [TypeDoc.TE]: 'TE',
      [TypeDoc.CE]: 'CE',
      [TypeDoc.RC]: 'RC',
      [TypeDoc.NITEXT]: 'NOP',
    };

    return documentTypeMap[docType] || 'CC';
  }

  private async handleSendRegisterMovement(context: IContext, movement: Movement, contract: Contract, type: number, taxpayer: Taxpayer, token: string): Promise<void> {
    const contractRequest = {
      type: type,
      actDocumentCode: contract.consecutive,
      generatorFactEndDate: this.formatDateWithHour(new Date(contract.contractDateEnd)),
      generatorFactStartDate: this.formatDateWithHour(new Date(contract.contractDateIni)),
      generatorFactValue: contract.contractValue,
      parametricActDocumentCodeType: 'AD4',
      payerDocumentParametricTypeCode: this.mapDocumentTypeToSigecCode(taxpayer.taxpayerNumberType),
      platform: 2,

      taxpayerDocumentNumber: taxpayer.taxpayerNumber.toString(),
      taxpayerName: taxpayer?.lastName
        ? `${(taxpayer.name || '').trim()} ${(taxpayer.middleName || '').trim()} ${(taxpayer.lastName || '').trim()} ${(taxpayer.secondSurname || '').trim()}`
          .replace(/\s+/g, ' ')
          .trim()
        : (taxpayer?.name || '').trim(),

    } as ReportContractRequest;

    const [result] = (await this.eventEmitter.emitAsync(SigecEvents.ReportContract, { context, data: contractRequest, token })) as ReportContractResponse[];

    movement.status = result?.httpstatus >= 200 && result.httpstatus < 300 ? MovementStatus.Send : MovementStatus.Error;
    movement.message = result?.message;

    await this.getRepository(context).manager.save(movement);
  }

  private async handleSendAdhesionMovement(context: IContext, movement: Movement, contract: Contract, taxpayer: Taxpayer, stamp: Stamp, token: string): Promise<void> {
    const adhesionRequest = {
      actDocumentCode: contract.consecutive,
      factCodeGenerator: movement.expenditureNumber,
      liquidatedValueId: movement.movId,
      liquidatedValue: movement.liquidatedValue,
      payerDocumentParametricTypeCode: this.mapDocumentTypeToSigecCode(taxpayer.taxpayerNumberType),
      stampNumber: stamp.stampNumber,
      taxpayerDocumentNumber: taxpayer.taxpayerNumber.toString(),
      type: movement.isRevert ? 0 : 1,
    } as RegisterLiquidationRequest;

    const [result] = (await this.eventEmitter.emitAsync(SigecEvents.RegisterLiquidation, { context, data: adhesionRequest, token })) as RegisterLiquidationResponse[];

    movement.status = result?.httpstatus >= 200 && result.httpstatus < 300 ? MovementStatus.Send : MovementStatus.Error;
    movement.message = result?.message;

    await this.getRepository(context).manager.save(movement);
  }

  private async handleSendApplyMovement(context: IContext, movement: Movement, token: string): Promise<void> {

    const applyRequest = {
      liquidatedValueId: movement.movId.replace('APPLY', 'ADHESION'),
      paidValueId: movement.movId,
      paymentDate: this.formatDateOnlyDate(new Date(movement.date)),
      type: movement.isRevert ? '0' : '1',
      valuePaid: movement.documentValue,
    } as RegisterPaymentRequest;

    const [result] = (await this.eventEmitter.emitAsync(SigecEvents.RegisterPayment, { context, data: applyRequest, token })) as RegisterPaymentResponse[];

    movement.status = result?.httpstatus >= 200 && result.httpstatus < 300 ? MovementStatus.Send : MovementStatus.Error;
    movement.message = result?.message;

    await this.getRepository(context).manager.save(movement);
  }

  public async sendMovementSigec(context: IContext, movId: string, token: string): Promise<Movement> {
    const { movement, contract, taxpayer, stamp } = await this.validateMovementDependencies(context, movId);

    context.organizationProduct = await Promise.resolve(contract.organizationProduct);
    context.movementId = movement.id;
    context.transactionId = (await movement.transaction)?.id

    switch (movement.type) {
      case TypeMovement.Register:
        await this.handleSendRegisterMovement(context, movement, contract, MovementRegisterType.Register, taxpayer, token);
        break;

      case TypeMovement.Amendment:
        await this.handleSendRegisterMovement(context, movement, contract, MovementRegisterType.Amendment, taxpayer, token);
        break;
      case TypeMovement.Assignment:
        await this.handleSendRegisterMovement(context, movement, contract, MovementRegisterType.Register, taxpayer, token);
        break;

      case TypeMovement.Adhesion:
        await this.handleSendAdhesionMovement(context, movement, contract, taxpayer, stamp, token);
        break;
      case TypeMovement.Apply:
        await this.handleSendApplyMovement(context, movement, token);
        break;
    }

    return movement;

  }

  private async sortMovements(context: IContext, movements: Movement[]): Promise<Movement[]> {
    const registers = movements.filter((m) => m.type === TypeMovement.Register);
    const amendments = movements.filter((m) => m.type === TypeMovement.Amendment);
    const assignments = movements.filter((m) => m.type === TypeMovement.Assignment);
    const adhesions = movements.filter((m) => m.type === TypeMovement.Adhesion);
    const applies = movements.filter((m) => m.type === TypeMovement.Apply);

    const adhesionMap = new Map<string, Movement>();
    for (const adh of adhesions) {
      if (adh.movId) {
        adhesionMap.set(adh.movId, adh);
      }
    }

    const sortedList: Movement[] = [];

    sortedList.push(...registers);
    sortedList.push(...amendments);
    sortedList.push(...assignments);

    for (const adh of adhesions) {
      const apply = applies.find((app) => app.associatedMovement === adh.movId);

      if (apply) {
        if (!adh.isRevert) {
          sortedList.push(adh, apply);
        } else {
          sortedList.push(apply, adh);
        }
      } else {
        sortedList.push(adh);
      }
    }

    const usedApplyIds = new Set(sortedList.filter((s) => s.type === TypeMovement.Apply).map((a) => a.id));
    const leftoverApplies = applies.filter((app) => !usedApplyIds.has(app.id));
    sortedList.push(...leftoverApplies);

    return sortedList;
  }

  @OnEvent(handleUnsentMovementsEvent, { suppressErrors: false })
  async onHandleUnsentMovementsEvent({
    context,
    expenditureNumber,
    contractId,
    contractType,
    isRevert
  }: {
    context: IContext;
    expenditureNumber: string;
    contractId: string;
    contractType: TypeMovement;
    isRevert?: boolean;
  }): Promise<void> {
    await this.handleUnsentMovements(context, expenditureNumber, contractId, contractType, isRevert);
  }

  @OnEvent(isValidMovementsEvent, { suppressErrors: false })
  async onIsValidMovementsEvent({
    context,
    input,
    movementsInput,
  }: {
    context: IContext;
    input: RequestCreateMovement;
    movementsInput: RequestCreateMovement[];
  }): Promise<boolean> {
    return await this.checkMovement(context, input, movementsInput);
  }

  @OnEvent(createMovementsEvent, { suppressErrors: false })
  async onCreateMovementsEvent({ context, movementsInput, lotId, contract, createContractInput }: { context: IContext; movementsInput: RequestCreateMovement[]; lotId: string; contract: Contract; createContractInput: CreateContractInput; }): Promise<Movement[]> {
    return await this.createMovements(context, movementsInput, contract, createContractInput);
  }

  @OnEvent(createMovementEvent, { suppressErrors: false })
  async onCreateMovementEvent({ context, movementInput, contract, createContractInput }: { context: IContext; movementInput: RequestCreateMovement; lotId: string; contract: Contract; createContractInput: CreateContractInput; }): Promise<Movement> {
    return await this.createMovement(context, movementInput, contract, createContractInput);
  }

  @OnEvent(updateMovementsEvent, { suppressErrors: false })
  async onUpdateMovementsEvent({ context, movementId, updateMovementInput }: { context: IContext; movementId: string; updateMovementInput: UpdateMovementInput; }): Promise<Movement> {
    return await this.update(context, movementId, updateMovementInput);
  }

  @OnEvent(sendMovementsToSigecEvent, { suppressErrors: false })
  async onSendMovementsToSigecEvent({ context, contractId }: { context: IContext; contractId: string }): Promise<void> {
    await this.sendMovementsToSigec(context, contractId);
  }

  @OnEvent(findMovementById, { suppressErrors: false })
  async onFindMovementByIdEvent({ context, movementId, orFail = false }: { context: IContext; movementId: string; orFail: boolean }): Promise<Movement> {
    return await this.findOneBy(context, { where: { id: movementId } }, orFail);
  }

}
