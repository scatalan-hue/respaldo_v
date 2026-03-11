import { FindOptionsWhere, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { FilesService } from 'src/general/files/services/files.service';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { findOrCreateLotContractEvent } from 'src/main/vudec/lots/lot-contract/constants/events.constants';
import { LotContract } from 'src/main/vudec/lots/lot-contract/entities/lot-contract.entity';
import { Lot } from 'src/main/vudec/lots/lot/entity/lot.entity';
import { Movement } from 'src/main/vudec/movement/entity/movement.entity';
import { Organization } from 'src/main/vudec/organizations/organization/entity/organization.entity';
import { createOrUpdateTaxpayerEvent } from 'src/main/vudec/taxpayer/constants/events.constants';
import { createContractByTransactionEvent, createContractEvent, findContractByIdEvent, validateContractEvent } from '../constants/events.constants';
import { FindContractArgs } from '../dto/args/find-contract.args';
import { CreateContractInput } from '../dto/inputs/create-contract.input';
import { UpdateContractInput } from '../dto/inputs/update-contract.input';
import { Contract } from '../entity/contract.entity';
import { handleContractMovements } from '../functions/assignLotAndMovements.function';
import { findOrCreateDailyLot } from '../functions/findLotOrDailyLot.function';
import { validateInput } from '../functions/validateInput.function';
import { UserTypes } from 'src/security/users/enums/user-type.enum';
import { OrdenType } from 'src/main/vudec/organizations/organization/enums/organization-orden.enum';
import { createContractHistoryEvent } from '../../contract-history/constants/events.constants';
import { OrganizationProduct } from 'src/main/vudec/organizations/organization-product/entities/organization-product.entity';
import { findOrganizationProductEvent } from 'src/main/vudec/organizations/organization-product/constants/events.constants';
import { findOrCreateOrganizationEvent } from 'src/main/vudec/organizations/organization/constants/events.constants';
import { CreateOrganizationInput } from 'src/main/vudec/organizations/organization/dto/inputs/create-organization.input';
import { findOrCreateCustomLotEvent } from 'src/main/vudec/lots/lot/constants/lot.constants';
import { DatosGovResponse } from 'src/external-api/sigec/dto/datos-gov.response.dto';
import { SigecEvents } from 'src/external-api/sigec/enums/sigec-events-type.enum';
import { ValidationResponse } from 'src/main/vudec/transactions/transaction/enum/validation-response.enum';
import { ValidationResponseModel } from 'src/main/vudec/transactions/transaction/dto/models/validation-response.model';
import { compareContractMovementsEvent } from 'src/main/vudec/movement/constants/events.constants';
import { ContractTransactionService } from './contract.transaction.service';
import { createContractDocumentFromTransactionEvent } from '../../contract-document/constants/events.constants';
import { TypeMovement } from 'src/main/vudec/movement/enums/movement-type.enum';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { CreateTaxpayerInput } from 'src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input';

export const serviceStructure = CrudServiceStructure({
  entityType: Contract,
  createInputType: CreateContractInput,
  updateInputType: UpdateContractInput,
  findArgsType: FindContractArgs,
});

@Injectable()
export class ContractService extends CrudServiceFrom(serviceStructure) {

  private readonly I18N_SPACE = I18N_SPACE.Contract;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly filesService: FilesService,
    private readonly contractTransactionService: ContractTransactionService
  ) {
    super();
  }

  private async findExistingContract(context: IContext, consecutive: string, lotId?: string): Promise<Contract> {
    const whereClause: FindOptionsWhere<Contract> = {
      consecutive,
      organizationProduct: {
        organization: {
          id: context?.organization?.id,
        },
      },
      ...(lotId && {
        lotContracts: { lot: { id: lotId } },
      })
    };

    return await this.findOneBy(context, { where: whereClause });
  }

  async beforeCreate(context: IContext, repository: Repository<Contract>, entity: Contract, createInput: CreateContractInput): Promise<void> {

  }

  async afterCreate(context: IContext, repository: Repository<Contract>, entity: Contract, createInput: CreateContractInput): Promise<void> {

    await this.eventEmitter.emitAsync(createContractHistoryEvent, {
      context,
      createInput: {
        ...createInput,
        contractId: entity.id,
        taxpayerId: (await entity.taxpayer).id,
        organizationProductId: (await entity.organizationProduct).id,
      },
    });
  }

  async afterUpdate(context: IContext, repository: Repository<Contract>, entity: Contract, updateInput: UpdateContractInput): Promise<void> {

    const typesToProcess = [TypeMovement.Amendment, TypeMovement.Assignment];

    for (const type of typesToProcess) {
      if (updateInput.typeMovements.includes(type)) {
        await this.eventEmitter.emitAsync(createContractHistoryEvent, {
          context,
          createInput: {
            ...updateInput,
            type,
            contractId: entity.id,
            taxpayerId: (await entity.taxpayer).id,
            organizationProductId: (await entity.organizationProduct).id,
          },
        });
      }
    }
  }
  async findOrCreate(context: IContext, createInput: CreateContractInput): Promise<Contract> {
    try {
      let lot: Lot;
      const { consecutive, lotId, decentralizedInput }: CreateContractInput = createInput;

      if (decentralizedInput?.taxpayerNumber) {

        const organizationInput: CreateOrganizationInput = {
          name: `${decentralizedInput?.name.trim()} ${decentralizedInput?.middleName.trim()} ${decentralizedInput?.lastName.trim()} ${decentralizedInput?.secondSurname.trim()}`,
          nit: decentralizedInput?.taxpayerNumber.trim(),
          ordenType: OrdenType.CentralizeEntity,
          email: decentralizedInput?.email.trim(),
          products: [{ name: context.product.name }],
          organizationParentId: context?.organization?.id
        };

        const [organization] = await this.eventEmitter.emitAsync(findOrCreateOrganizationEvent, {
          context,
          organizationInput,
        }) as [Organization];

        const [organizationProduct] = await this.eventEmitter.emitAsync(findOrganizationProductEvent, {
          context,
          organizationId: organization.id,
          productId: context.product.id,
        }) as [OrganizationProduct];

        context.organization = organization;
        context.organizationProduct = organizationProduct;
      }

      const existingContract: Contract = await this.findExistingContract(context, consecutive, lotId);

      if (!existingContract) {
        return await this.create(context, createInput);
      }

      await validateInput(context, createInput);

      if (context.organization.ordenType == OrdenType.CentralizeEntity) {
        [lot] = await this.eventEmitter.emitAsync(findOrCreateCustomLotEvent, {
          context,
          name: createInput.contractName,
          internalId: createInput.internalId
        }) as [Lot];
      } else {
        lot = await findOrCreateDailyLot(context, this.eventEmitter, createInput);
      }

      const [lotContract] = await this.eventEmitter.emitAsync(findOrCreateLotContractEvent, {
        context,
        input: { lotId: lot?.id, contractId: existingContract?.id },
      });

      existingContract.lotContracts = [lotContract] as LotContract[];

      createInput.lotId = lot?.id as string;

      const [taxpayer] = await this.eventEmitter.emitAsync(createOrUpdateTaxpayerEvent, {
        context,
        createInput: { ...createInput.taxpayerInput, type: UserTypes.Public },
      });

      existingContract.taxpayer = taxpayer;

      if (createInput?.documents?.length > 0) {
        await this.eventEmitter.emitAsync(createContractDocumentFromTransactionEvent, {
          context,
          createInput: createInput.documents,
          contractId: existingContract.id
        });
      }

      const movements: Movement[] = await handleContractMovements(context, this.eventEmitter, existingContract, createInput, taxpayer);

      existingContract.movements = movements;

      await this.update(context, existingContract.id, {
        ...createInput,
        lotId: lot.id,
        taxpayerId: taxpayer.id
      });

      return existingContract;

    } catch (error) {
      throw error;
    }
  }

  async createContractByTransaction(oldContext: IContext, oldCreateInput: CreateContractInput, transactionId: string): Promise<Contract> {
    try {
      const { consecutive, lotId }: CreateContractInput = oldCreateInput;
      let createInput: CreateContractInput;

      if (process.env.VALIDATION_SECOP == 'true') {
        createInput = await this.fillContractBySECOP(oldContext, oldCreateInput);
      } else {
        createInput = oldCreateInput;
      }

      //Entidad descentralizada y obtencion de contexto
      const context = await this.contractTransactionService.handleDecentralizedOrganization(oldContext, createInput, transactionId);
      await validateInput(context, createInput);

      //Tercero
      const [taxpayer] = await this.eventEmitter.emitAsync(createOrUpdateTaxpayerEvent, {
        context,
        createInput: { ...createInput.taxpayerInput, type: UserTypes.Public },
      }) as [Taxpayer];

      //Lote
      const lot: Lot = await this.contractTransactionService.resolveLot(context, createInput);
      createInput.lotId = lot?.id as string;

      //Contrato
      let existingContract: Contract = await this.findExistingContract(context, consecutive, lotId);
      if (!existingContract) {
        existingContract = await this.create(context,
          {
            ...createInput,
            taxpayerId: taxpayer.id,
            organizationProductId: context.organizationProduct.id
          });
      }

      const [lotContract] = await this.eventEmitter.emitAsync(findOrCreateLotContractEvent, {
        context,
        input: { lotId: lot?.id, contractId: existingContract?.id },
      });
      existingContract.lotContracts = [lotContract] as LotContract[];

      //Documentos
      if (createInput?.documents?.length > 0) {
        await this.eventEmitter.emitAsync(createContractDocumentFromTransactionEvent, {
          context,
          createInput: createInput.documents,
          contractId: existingContract.id
        });
      }

      //Movimientos
      const {
        movements,
        typeMovements
      } = await this.contractTransactionService.handleContractMovements(context, existingContract, createInput, taxpayer, transactionId);
      existingContract.movements = movements;

      //Actualizar contrato
      await this.update(context, existingContract.id, {
        ...createInput,
        typeMovements,
        lotId: lot.id,
        taxpayerId: taxpayer.id
      });

      return existingContract;

    } catch (error) {
      throw error;
    }
  }

  async contractLots(context: IContext, contract: Contract): Promise<Lot[]> {
    const contractLots = (await contract?.lotContracts) ?? [];
    return await Promise.all(contractLots.map(async (contractLot) => contractLot.lot));
  }

  async organization(context: IContext, contract: Contract): Promise<Organization> {
    const organizationProduct = await contract?.organizationProduct;

    const organization = await organizationProduct?.organization;

    return organization;
  }

  private async fillContractBySECOP(context: IContext, createInput: CreateContractInput): Promise<CreateContractInput> {
    const taxpayerInput: CreateTaxpayerInput = {
      ...createInput.taxpayerInput,
      taxpayerNumber: context.dataSigec.data.documento_proveedor,
      name: context.dataSigec.data.proveedor_adjudicado,
      middleName: '',
      lastName: '',
      secondSurname: '',
    };

    const contractValue = parseFloat(context.dataSigec.data.valor_del_contrato);
    if (!isNaN(contractValue)) {
      createInput.contractValue = contractValue;
    }

    if (context.dataSigec.data.fecha_de_inicio_del_contrato) {
      const startDate = new Date(context.dataSigec.data.fecha_de_inicio_del_contrato);
      if (!isNaN(startDate.getTime())) {
        createInput.contractDateIni = startDate;
      }
    }

    if (context.dataSigec.data.fecha_de_fin_del_contrato) {
      const endDate = new Date(context.dataSigec.data.fecha_de_fin_del_contrato);
      if (!isNaN(endDate.getTime())) {
        createInput.contractDateEnd = endDate;
      }
    }

    //createInput.contractDate = new Date(context.dataSigec.data.fecha_de_firma);

    createInput.taxpayerInput = taxpayerInput;

    return createInput;
  }

  private async compareContractData(existingContract: Contract, newContractInput: CreateContractInput): Promise<boolean> {
    const existingTaxpayer = await Promise.resolve(existingContract.taxpayer);

    if (Number(existingContract.contractValue) !== Number(newContractInput.contractValue)) {
      return false;
    }

    if (existingContract.contractType !== newContractInput.contractType) {
      return false;
    }

    const existingContractDate = existingContract.contractDate
      ? new Date(existingContract.contractDate).toISOString().split('T')[0]
      : null;
    const newContractDate = newContractInput.contractDate
      ? new Date(newContractInput.contractDate).toISOString().split('T')[0]
      : null;

    if (existingContractDate !== newContractDate) {
      return false;
    }

    const existingContractDateIni = existingContract.contractDateIni
      ? new Date(existingContract.contractDateIni).toISOString().split('T')[0]
      : null;
    const newContractDateIni = newContractInput.contractDateIni
      ? new Date(newContractInput.contractDateIni).toISOString().split('T')[0]
      : null;

    if (existingContractDateIni !== newContractDateIni) {
      return false;
    }

    const existingContractDateEnd = existingContract.contractDateEnd
      ? new Date(existingContract.contractDateEnd).toISOString().split('T')[0]
      : null;
    const newContractDateEnd = newContractInput.contractDateEnd
      ? new Date(newContractInput.contractDateEnd).toISOString().split('T')[0]
      : null;

    if (existingContractDateEnd !== newContractDateEnd) {
      return false;
    }

    if (existingTaxpayer?.taxpayerNumber !== newContractInput.taxpayerInput.taxpayerNumber) {
      return false;
    }

    return true;
  }

  private async existingContractAndMovementsIdentical(context: IContext, createContractInput: CreateContractInput): Promise<ValidationResponseModel> {
    //TODO: Esto deberia ser validado solo cuando el tipo de transaccion sea edicion o el mismo numero de egreso

    const existingContract = await this.findOneBy(context,
      {
        where: {
          consecutive: createContractInput.consecutive,
          organizationProduct: {
            organization: {
              id: context.organization.id
            }
          }
        }
      }
    );

    if (existingContract) {
      const isContractIdentical = await this.compareContractData(existingContract, createContractInput);

      const [isMovementsIdentical] = await this.eventEmitter.emitAsync(compareContractMovementsEvent, {
        context,
        contractId: existingContract.id,
        movementsInput: createContractInput.movementsInput || [],
      }) as [Boolean];

      if (isMovementsIdentical && isContractIdentical) {
        return {
          status: ValidationResponse.CONTRACT_DUPLICATED,
          message: `El contrato con número consecutivo ${createContractInput.consecutive} ya existe con la misma información y movimientos asociados.`,
        };
      }
    }
  }

  private async validateContract(context: IContext, createContractInput: CreateContractInput): Promise<ValidationResponseModel> {
    //Caso 1: Buscar contrato existente identico con movimientos
    //TODO: Esto deberia ser validado solo cuando el tipo de transaccion sea edicion o el mismo numero de egreso
    const existingContractValidation = await this.existingContractAndMovementsIdentical(context, createContractInput);

    if (existingContractValidation) {
      return existingContractValidation;
    }

    //Validacion SIGEC
    if (process.env.VALIDATION_SECOP !== 'true') {
      return { status: ValidationResponse.IN_PROCESS };
    }

    const [sigecValidation] = await this.eventEmitter.emitAsync(SigecEvents.ValidateContract, {
      context,
      contractId: createContractInput.consecutive
    }) as [DatosGovResponse];

    //Caso 2: Sin respuesta de DATOS.GOV o fallido
    if (sigecValidation?.error) {
      return {
        status: ValidationResponse.CONTRACT_SIGEC_ERROR,
        message: sigecValidation.message
      };
    }

    //Caso 3: Documento de tercero no coincide
    if (sigecValidation.data.documento_proveedor !== createContractInput?.taxpayerInput?.taxpayerNumber?.toString()) {
      return {
        status: ValidationResponse.TAXPAYER_SIGEC_INCORRECT,
        message: `El número de documento del tercero enviado (${createContractInput?.taxpayerInput?.taxpayerNumber}) no coincide con el registrado en SIGEC (${sigecValidation.data.documento_proveedor})`
      };
    }

    context.dataSigec = sigecValidation;
    return { status: ValidationResponse.IN_PROCESS };
  }


  @OnEvent(findContractByIdEvent)
  async onFindContractByIdEvent({ context, id, orFail = false }: { context: IContext; id: string; orFail: boolean }): Promise<Contract> {
    return await this.findOneBy(context, { where: { id } }, orFail);
  }

  @OnEvent(createContractEvent)
  async onCreateContractEvent({ context, createInput }: { context: IContext; createInput: CreateContractInput }): Promise<Contract> {
    try {
      return await this.findOrCreate(context, createInput);
    } catch (err) {
      const isUniqueError = err && (err.name === 'QueryFailedError' || /unique|duplicate|UNIQUE KEY|Violation of UNIQUE KEY/i.test(err.message || ''));
      if (isUniqueError) {
        // intento de fallback: buscar el contrato existente por consecutive + organizationProductId
        try {
          const existing = await this.findOneBy(context, {
            where: {
              consecutive: String(createInput?.consecutive || '').trim(),
              organizationProductId: createInput?.organizationProductId,
            },
          }, false);
          if (existing) return existing;
        } catch (findErr) {
          // no hacer nada aquí, seguir re-lanzando el error original
        }
      }
      throw err;
    }
  }

  @OnEvent(validateContractEvent, { suppressErrors: false })
  async onValidateContractEvent({ context, createInput }: { context: IContext; createInput: CreateContractInput }): Promise<ValidationResponseModel> {
    return await this.validateContract(context, createInput);
  }

  @OnEvent(createContractByTransactionEvent, { suppressErrors: false })
  async onCreateContractByTransactionEvent({ context, createInput, transactionId }: { context: IContext; createInput: CreateContractInput; transactionId: string }): Promise<Contract> {
    return await this.createContractByTransaction(context, createInput, transactionId);
  }
}
