import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { GetUnreadDocumentsDto } from '../dto/models/get-unread-document.model';

enum SiiafeMethod {
  GetDocs = 'getUnreadDocuments',
}

export interface DocumentTransactionDetailDTO {
  transactionId: number;
  itemId: number;
  logData: string; // Campo de interés
}

export interface DocumentTransactionDTO {
  id: number;
  yearCode: number;
  documentCode: number;
  type: number;
  subType: string;
  date: string; // ISO string para fecha
  searchDate: string | null; // Puede ser nulo
  guid: string;
  baseGuid: string;
  details: DocumentTransactionDetailDTO[]; // Detalles relacionados
}

@Injectable()
export class SiiafeManagerService {
  constructor(private readonly httpService: HttpService) {}

  async getDocs(url: string, context: IContext): Promise<DocumentTransactionDTO[]> {
    const toUrl = url + '/' + SiiafeMethod.GetDocs;

    const payload: GetUnreadDocumentsDto = {
      type: "SIGEC"
    }

    try {
      const response = await firstValueFrom(this.httpService.post(toUrl, payload));

      return response.data as DocumentTransactionDTO[];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
