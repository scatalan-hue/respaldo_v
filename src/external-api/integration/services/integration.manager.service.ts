import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { IntegrationMethod } from '../enum/method.enum';
import { DocumentTransactionDetailModel, DocumentTransactionModel } from '../dto/models/document-transaction.model';

@Injectable()
export class IntegrationManagerService {
  constructor(private readonly httpService: HttpService) {}

  async getDocs(url: string, context: IContext): Promise<DocumentTransactionModel[]> {
    const toUrl = url + '/' + IntegrationMethod.GetDocs;

    try {
      const response = await firstValueFrom(this.httpService.post(toUrl));

      return response.data as DocumentTransactionModel[];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
