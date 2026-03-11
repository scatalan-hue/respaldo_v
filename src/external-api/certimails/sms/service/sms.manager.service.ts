import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISmsResponse, ISmsRequest } from '../interface/sms.interface';

enum SmsMethod {
  Send = 'rest/WebServices_API/Publicadores/Sms/Enviar',
}

@Injectable()
export class SmsManagerService {
  constructor(private readonly httpService: HttpService) {}

  async sendSms(structure: ISmsRequest): Promise<ISmsResponse> {
    try {
      const url = process.env.CERTIMAILS_URL + SmsMethod.Send;
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': structure.ApiKey,
      };

      const payload = '{ "Request": ' + JSON.stringify(structure) + '}';
      const response = await firstValueFrom(this.httpService.post(url, payload, { headers }));

      if (response.data.Response.HasError) {
        throw new InternalServerErrorException(response.data.ErrMessage);
      }

      return response.data.Response;
    } catch (error) {
      return {
        HasError: true,
        ErrMessage: error.message,
      } as ISmsResponse;
    }
  }
}
