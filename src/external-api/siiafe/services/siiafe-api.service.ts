import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateContractInput } from 'src/main/vudec/contracts/contract/dto/inputs/create-contract.input';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { DocumentTransactionDTO, SiiafeManagerService } from './siiafe-api.manager.service';
import { createTransactionByContractEvent, createTransactionEvent } from 'src/main/vudec/transactions/transaction/constants/events.constants';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';

@Injectable()
export class SiiafeService {
  constructor(
    private readonly siiafeMannager: SiiafeManagerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  
  public async SaveTransactionDocs(context: IContext): Promise<string[]> {

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
          }));

          if (dataFormatted?.length > 0) allDocs = allDocs.concat(dataFormatted);
        });
      }
    }

    const guidCreated: string[] = [];
    for (const x of allDocs) {
      const [transaction] = await this.eventEmitter.emitAsync(createTransactionEvent, { context, createInput: { data: JSON.stringify(x), key: x.guid } });

      if (transaction instanceof Transaction) {
        guidCreated.push(x.guid);
      }
    }

    return guidCreated;
  }
  
  
  
  public async GetPendingDocs(context: IContext): Promise<string[]> {

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
  }

  private async requestDocs(url: string, context: IContext): Promise<DocumentTransactionDTO[]> {
    return await this.siiafeMannager.getDocs(url, context);
  }
}
