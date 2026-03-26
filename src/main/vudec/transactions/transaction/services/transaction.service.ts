import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { createTransactionByContractEvent, findTransactionByIdEvent } from '../constants/events.constants';
import { CreateTransactionInput } from '../dto/inputs/create-transaction.input';
import { UpdateTransactionInput } from '../dto/inputs/update-transaction.input';
import { Transaction } from '../entities/transaction.entity';
import { createTransactionHistoryEvent } from '../../transaction-history/constants/events.constants';
import { CreateContractInput } from 'src/main/vudec/contracts/contract/dto/inputs/create-contract.input';
import { createOrUpdateTaxpayerEvent } from 'src/main/vudec/taxpayer/constants/events.constants';
import { UserTypes } from 'src/security/users/enums/user-type.enum';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { SigecEvents } from 'src/external-api/sigec/enums/sigec-events-type.enum';
import { ValidationResponseModel } from '../dto/models/validation-response.model';
import { ValidationResponse } from '../enum/validation-response.enum';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { validateMovementsEvent } from 'src/main/vudec/movement/constants/events.constants';
import { createContractByTransactionEvent, validateContractEvent } from 'src/main/vudec/contracts/contract/constants/events.constants';
import { Contract } from 'src/main/vudec/contracts/contract/entity/contract.entity';
import { TransactionAction } from '../enum/transaction-action.enum';
import { createWebserviceLogEvent } from 'src/general/webservice-log/constants/events.constants';
import { HttpMethod } from 'src/general/webservice-log/enums/http-method.enum';

export const serviceStructure = CrudServiceStructure({
	entityType: Transaction,
	createInputType: CreateTransactionInput,
	updateInputType: UpdateTransactionInput,
});

@Injectable()
export class TransactionService extends CrudServiceFrom(serviceStructure) {
	constructor(
		private readonly eventEmitter: EventEmitter2,
	) { super(); }

	private readonly I18N_SPACE = I18N_SPACE.Transaction;

	async afterCreate(context: IContext, repository: Repository<Transaction>, entity: Transaction, createInput: CreateTransactionInput): Promise<void> {
		if (!createInput.parentId) {
			await this.eventEmitter.emitAsync(createTransactionHistoryEvent, { context, createInput: { ...createInput, transactionId: entity.id, id: undefined } });
		}
	}

	async beforeUpdate(context: IContext, repository: Repository<Transaction>, entity: Transaction, updateInput: UpdateTransactionInput): Promise<void> {

		if (entity.status === TransactionStatus.COMPLETE) throw new BadRequestException('No se puede modificar una transacción que ya ha sido completada.');

		if ((Number(updateInput.contractValue) !== Number(entity.contractValue)) || (updateInput.contractNumber !== entity.contractNumber)) {
			console.log('Creating history due to contract value/number change')
		}
	}

	async manageTransaction(context: IContext, createContractInput: CreateContractInput): Promise<Transaction> {

		console.log('[TransactionService.manageTransaction] context.organizationProduct.url INICIO:', context.organizationProduct?.url);
		console.log('[TransactionService.manageTransaction] context.organizationProduct:', JSON.stringify({
			id: context.organizationProduct?.id,
			key: context.organizationProduct?.key?.substring(0, 20),
			url: context.organizationProduct?.url,
		}, null, 2));

		const [taxpayer] = await this.eventEmitter.emitAsync(createOrUpdateTaxpayerEvent, {
			context,
			createInput: { ...createContractInput.taxpayerInput, type: UserTypes.Public },
		}) as [Taxpayer];
		if (!(taxpayer instanceof Taxpayer)) throw new Error('Error creando o editando el tercero asociado al contrato.');

		const createInput: CreateTransactionInput = {
			data: JSON.stringify(createContractInput),
			key: createContractInput.baseGuid,
			taxpayerId: taxpayer.id,
			documentPrincipal: createContractInput.documentPrincipal,
			description: createContractInput.description,
			contractNumber: createContractInput.consecutive,
			contractValue: !createContractInput.contractValue ? 0 : createContractInput.contractValue,
			organizationProductId: (await context.organizationProduct)?.id,
			action: createContractInput.isRevert ? TransactionAction.REVERT : TransactionAction.REGISTER,
		};

		const transaction = await this.findOneBy(context, { where: { key: createContractInput.baseGuid } }, false);

		if (transaction) {
			createInput.parentId = transaction.id;

			await this.eventEmitter.emitAsync(createTransactionHistoryEvent, {
				context, createInput: {
					...createInput,
					id: undefined,
					transactionId: transaction.id,
					isRevert: createContractInput.isRevert
				}
			});
		}

		const result = await this.create(context, createInput);

		this.eventEmitter.emit(createWebserviceLogEvent, {
			context,
			payload: {
				config: {
					serviceName: '',
					url: (await context.organizationProduct.url),
					method: HttpMethod.POST,
					requestData: undefined
				},
				responseOrError: JSON.stringify(createContractInput),
				isError: false
			}
		});

		await this.applyTransaction(context, result.id);

		return result;
	}

	async applyTransaction(context: IContext, transactionId: string): Promise<ValidationResponseModel> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Timeout: La transacción tardó demasiado en procesarse')), 5 * 60 * 1000); //5 minutos
		});

		try {
			return await Promise.race([
				this.executeTransactionProcess(context, transactionId),
				timeoutPromise
			]);
		} catch (error) {
			await this.update(context, transactionId, {
				id: transactionId.toUpperCase(),
				status: TransactionStatus.ERROR,
				message: error?.message,
				validation: ValidationResponse.ERROR
			});
			throw error;
		}
	}

	private async executeTransactionProcess(context: IContext, transactionId: string): Promise<ValidationResponseModel> {
		const transaction = await this.findOneBy(context,
			{
				where: { id: transactionId },
				relations: ['organizationProduct', 'organizationProduct.organization', 'organizationProduct.product'],
			}
			, true
		);

		context.organizationProduct = await transaction.organizationProduct;
		context.organization = await (context.organizationProduct).organization;
		context.product = await (context.organizationProduct).product;
		context.transactionId = transaction.id;

		const transactionData: CreateContractInput = JSON.parse(transaction.data);

		if (transaction.status === TransactionStatus.COMPLETE || transaction.status === TransactionStatus.IN_PROCESS) {
			return {
				status: ValidationResponse.TRANSACTION_PROCESSED,
				message: 'La transaccion ya ha sido procesada previamente.'
			};
		}

		await this.update(context, transaction.id, { id: transaction.id, status: TransactionStatus.IN_PROCESS });

		//Validacion
		const validationResponse = await this.validateApplyTransaction(context, transactionData);
		if (validationResponse.status !== ValidationResponse.IN_PROCESS) {
			await this.update(context, transaction.id, { id: transaction.id, validation: validationResponse.status, message: validationResponse.message, status: TransactionStatus.ERROR });
			return validationResponse;
		}

		//Aplicacion
		const [contract] = await this.eventEmitter.emitAsync(createContractByTransactionEvent, {
			context,
			createInput: transactionData,
			transactionId: transaction.id
		}) as [Contract];

		//Edicion de transaccion completa
		await this.update(context, transactionId, {
			id: transactionId.toUpperCase(),
			status: TransactionStatus.COMPLETE,
			message: '',
			validation: ValidationResponse.COMPLETE,
			contractNumber: contract.consecutive,
			contractValue: contract.contractValue,
			contractId: contract.id,
		});

		return {
			status: ValidationResponse.COMPLETE,
			message: 'La transacción ha sido procesada correctamente.'
		};
	}

	async validateApplyTransaction(context: IContext, createContractInput: CreateContractInput): Promise<ValidationResponseModel> {

		//Caso 1: Contrato sin numero consecutivo
		if (!createContractInput.consecutive) {
			return {
				status: ValidationResponse.CONTRACT_INCOMPLETE,
				message: 'El contrato no tiene numero consecutivo asignado.'
			};
		}

		//Caso 2: Validacion de movimientos asociados al contrato
		const [validationMovements] = await this.eventEmitter.emitAsync(validateMovementsEvent, {
			context,
			movementsInput: createContractInput.movementsInput || [],
		}) as [ValidationResponseModel];

		if (validationMovements.status !== ValidationResponse.IN_PROCESS) {
			return validationMovements;
		}

		//Caso 3: Validacion de contrato (VUDEC y SIGEC)
		const [validationContract] = await this.eventEmitter.emitAsync(validateContractEvent, {
			context,
			createInput: createContractInput
		}) as [ValidationResponseModel];

		return validationContract;

	}

	@OnEvent(createTransactionByContractEvent, { suppressErrors: false })
	async onCreateTransactionByContract({ context, createContractInput }: { context: IContext; createContractInput: CreateContractInput }): Promise<Transaction> {
		return await this.manageTransaction(context, createContractInput);
	}

	@OnEvent(findTransactionByIdEvent, { suppressErrors: false })
	async onFindTransactionById({ context, id, orFail }: { context: IContext; id: string, orFail?: boolean }): Promise<Transaction> {
		return await this.findOne(context, id, orFail);
	}

	async validateSecop(context: IContext, contractId: string): Promise<void> {
		await this.eventEmitter.emitAsync(SigecEvents.ValidateContract, {
			context,
			contractId,
		});
	}
}
