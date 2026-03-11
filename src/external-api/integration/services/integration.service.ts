import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateContractInput } from 'src/main/vudec/contracts/contract/dto/inputs/create-contract.input';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { IntegrationManagerService } from './integration.manager.service';
import { DocumentTransactionModel } from '../dto/models/document-transaction.model';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';
import { createTransactionByContractEvent } from 'src/main/vudec/transactions/transaction/constants/events.constants';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationManagerService: IntegrationManagerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async GetPendingDocs(context: IContext): Promise<string[]> {
    try {
      if (!context?.organizationProduct?.url || context?.organizationProduct?.url == '') {
        throw new InternalServerErrorException('Connection to external system not found');
      }

      const documents = await this.requestDocs(context.organizationProduct.url, context);
      let allDocs: CreateContractInput[] = [];
      
      for (let document of documents) {
        const data = document?.details;

        if (data?.length > 0) {
          data.forEach((x) => {
            const dataFormatted: CreateContractInput[] = JSON.parse(x.logData).map((item) => ({
              ...item,
              guid: document.guid,
              baseGuid: document.baseGuid,
            }));

            if (dataFormatted?.length > 0) allDocs = allDocs.concat(dataFormatted);
          });
        }
      }

      const guidCreated: string[] = [];
      for (const x of allDocs) {
        const [transaction] = await this.eventEmitter.emitAsync(createTransactionByContractEvent, { context, createContractInput: x });

        if (transaction instanceof Transaction) {
          guidCreated.push(x.guid);
        }
      }

      return guidCreated;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async requestDocs(url: string, context: IContext): Promise<DocumentTransactionModel[]> {
    return await this.integrationManagerService.getDocs(url, context);
  }
}
