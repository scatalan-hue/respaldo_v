import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { CreateContractDocumentInput } from '../dto/inputs/create-contract-document.input';
import { UpdateContractDocumentInput } from '../dto/inputs/update-contract-document.input';
import { ContractDocument } from '../entities/contract-document.entity';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { createContractDocumentEvent, createContractDocumentFromTransactionEvent } from '../constants/events.constants';
import { FindContractDocumentArgs } from '../dto/args/find-contract-document.args';

export const serviceStructure = CrudServiceStructure({
	entityType: ContractDocument,
	createInputType: CreateContractDocumentInput,
	updateInputType: UpdateContractDocumentInput,
	findArgsType: FindContractDocumentArgs
});

@Injectable()
export class ContractDocumentService extends CrudServiceFrom(serviceStructure) {

	private async createFromTransaction(context: IContext, createInput: CreateContractDocumentInput[], contractId: string): Promise<ContractDocument[]> {

		const createdDocuments: ContractDocument[] = [];
		for (const input of createInput) {
			const document = await this.createOrUpdate(context, input, contractId);
			createdDocuments.push(document);
		}
		return createdDocuments;
	}

	async createOrUpdate(context: IContext, createInput: CreateContractDocumentInput, contractId: string): Promise<ContractDocument> {

		const document = await this.findOneBy(context, {
			where: {
				document: createInput.document,
				typeDocument: createInput.typeDocument,
				contract: { id: contractId },
				transaction: { id: context.transactionId }
			},
		});

		if (document) return await this.update(context, document.id, { ...createInput, id: document.id });
		else return await this.create(context, { ...createInput, contractId: contractId, transactionId: context.transactionId });
	}

	@OnEvent(createContractDocumentEvent, { suppressErrors: false })
	async onCreateContractDocumentEvent({ context, createInput }: { context: IContext; createInput: CreateContractDocumentInput }): Promise<ContractDocument> {
		return await this.create(context, createInput);
	}

	@OnEvent(createContractDocumentFromTransactionEvent, { suppressErrors: false })
	async onCreateContractDocumentFromTransactionEvent({ context, createInput, contractId }: { context: IContext; createInput: CreateContractDocumentInput[]; contractId: string }): Promise<ContractDocument[]> {
		return await this.createFromTransaction(context, createInput, contractId);
	}
}
