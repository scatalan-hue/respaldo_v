import { Repository } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { uniq } from 'lodash';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { FilesService } from 'src/general/files/services/files.service';
import { sendResponse } from 'src/common/i18n/functions/response';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { CreateContractInput } from '../dto/inputs/create-contract.input';
import { Contract } from '../entity/contract.entity';
import { Lot } from 'src/main/vudec/lots/lot/entity/lot.entity';
import { Movement } from 'src/main/vudec/movement/entity/movement.entity';
import { FileInfo } from 'src/general/files/entities/file-info.entity';
import { Organization } from 'src/main/vudec/organizations/organization/entity/organization.entity';
import { OrganizationProduct } from 'src/main/vudec/organizations/organization-product/entities/organization-product.entity';
import { CreateOrganizationInput } from 'src/main/vudec/organizations/organization/dto/inputs/create-organization.input';
import { OrdenType } from 'src/main/vudec/organizations/organization/enums/organization-orden.enum';
import { findOrCreateOrganizationEvent } from 'src/main/vudec/organizations/organization/constants/events.constants';
import { findOrganizationProductByIdEvent, findOrganizationProductEvent } from 'src/main/vudec/organizations/organization-product/constants/events.constants';
import { findOrCreateCustomLotEvent } from 'src/main/vudec/lots/lot/constants/lot.constants';
import { findOrCreateDailyLot } from '../functions/findLotOrDailyLot.function';
import { handleContractMovements } from '../functions/assignLotAndMovements.function';
import { CreateTaxpayerInput } from 'src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input';
import { LotContract } from 'src/main/vudec/lots/lot-contract/entities/lot-contract.entity';
import { findOrCreateLotContractEvent } from 'src/main/vudec/lots/lot-contract/constants/events.constants';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { createMovementEvent, createMovementsEvent, handleUnsentMovementsEvent, isValidMovementsEvent, validateExistingMovementsEvent } from 'src/main/vudec/movement/constants/events.constants';
import { RequestCreateMovement } from 'src/main/vudec/movement/dto/models/request-create-movement.model';
import { create } from 'domain';
import { TypeMovement } from 'src/main/vudec/movement/enums/movement-type.enum';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';
import { findTransactionByIdEvent } from 'src/main/vudec/transactions/transaction/constants/events.constants';

@Injectable()
export class ContractTransactionService {
    private readonly I18N_SPACE = I18N_SPACE.Contract;

    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly filesService: FilesService,
    ) {}

    async handleDecentralizedOrganization(context: IContext, createInput: CreateContractInput, transactionId: string): Promise<IContext> {
        const { decentralizedInput } = createInput;
        
        if (!decentralizedInput?.taxpayerNumber) return context;

        const organizationInput = this.buildOrganizationInput(context, decentralizedInput);
        
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

        return context;
    }

    private buildOrganizationInput(context: IContext, decentralizedInput: CreateTaxpayerInput): CreateOrganizationInput {
        const fullName = [
            decentralizedInput?.name?.trim(),
            decentralizedInput?.middleName?.trim(),
            decentralizedInput?.lastName?.trim(),
            decentralizedInput?.secondSurname?.trim()
        ].filter(Boolean).join(' ');

        return {
            name: fullName,
            nit: String(decentralizedInput.taxpayerNumber || "").trim(),
            ordenType: OrdenType.CentralizeEntity,
            email: String(decentralizedInput.email || "").trim(),
            products: [{ name: context.product.name }],
            organizationParentId: context?.organization?.id
        };
    }

    async resolveLot(context: IContext, createInput: CreateContractInput): Promise<Lot> {
        let lot: Lot;
        
        if (context.organization.ordenType === OrdenType.CentralizeEntity) {
            [lot] = await this.eventEmitter.emitAsync(findOrCreateCustomLotEvent, {
                context,
                name: createInput.contractName,
                internalId: createInput.internalId
            }) as [Lot];
        } else {
            lot = await findOrCreateDailyLot(context, this.eventEmitter, createInput);
        }

        return lot;
    }

    async handleContractMovements(
		context: IContext, 
		contract: Contract,
		createInput: CreateContractInput,
        taxpayer: Taxpayer,
        transactionId: string,
    ): Promise<{ movements: Movement[], typeMovements: TypeMovement[] }> {
 		try {
            const typeMovements: TypeMovement[] = [];
            let registerMovement: RequestCreateMovement;

            const movementsInput: RequestCreateMovement[] = createInput.movementsInput ? createInput.movementsInput.map((movement) => ({ ...movement, lotId: createInput.lotId, contractId: contract.id })) : [];
            const expenditureNumbers = uniq(movementsInput.filter((item) => !!item.expenditureNumber).map((item) => item.expenditureNumber));
        
            // Se eliminan los movimientos no enviados aun y se revierten los que ya existan
            for (const expenditureNumber of expenditureNumbers) {
                await this.eventEmitter.emitAsync(handleUnsentMovementsEvent, { context, expenditureNumber, contractId: contract.id, contractType: createInput.contractType, isRevert: createInput.isRevert });
            }

			//Se valida que tengan o no que revertir los anteriores movimientos de la misma transaccion para volver a enviarlos 
			//(no entra el caso en este punto si los movimientos son iguales o no porque ya se valida en la creacion de la transaction)
			//await this.eventEmitter.emitAsync(validateExistingMovementsEvent, { context, contractId: contract.id });

			// Se valida que los movimientos sean válidos
			let movementsInputToSave: RequestCreateMovement[] = [];
            for (const element of movementsInput) {
                const [isValid] = await this.eventEmitter.emitAsync(isValidMovementsEvent, { context, input: element, movementsInput });
            
                if (element.type == TypeMovement.Register) registerMovement = element;
                
                if (isValid) {
                    movementsInputToSave.push({ 
                        ...element,
                        transactionId,
                        taxpayerId: taxpayer.id
                    });
                }
            }

            //Movimiento otrosi
            if ((Number(contract.contractValue) !== Number(createInput.contractValue)) && !createInput.isRevert) {           
                typeMovements.push(TypeMovement.Amendment);
                await this.eventEmitter.emitAsync(createMovementEvent, {
                    context,
                    movementInput: { ...registerMovement, type: TypeMovement.Amendment, transactionId, taxpayerId: taxpayer.id },
                    contract,
                    createContractInput: createInput
                }) as [Movement];
            }

            const contractTaxpayer = await Promise.resolve(contract?.taxpayer);

            //Movimiento cesion
            if ((taxpayer.taxpayerNumber !== contractTaxpayer?.taxpayerNumber)  && !createInput.isRevert) {
                typeMovements.push(TypeMovement.Assignment);
                await this.eventEmitter.emitAsync(createMovementEvent, {
                    context,
                    movementInput: { ...registerMovement, type: TypeMovement.Assignment, transactionId, taxpayerId: taxpayer.id },
                    contract,
                    createContractInput: createInput
                }) as [Movement];
            }

            // Crear movimientos restantes al contrato
            const [movements] = await this.eventEmitter.emitAsync(createMovementsEvent, {
                context,
                movementsInput: movementsInputToSave,
                lotId: createInput.lotId,
                contract,
                createContractInput: createInput
            }) as [Movement[]];
        
            return {
                movements,
                typeMovements
            }

        } catch (error) {
            throw error;
        }
    }
}