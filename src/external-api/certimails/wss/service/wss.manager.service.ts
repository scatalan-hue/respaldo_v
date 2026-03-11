import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IWssResponse, IWssRequest } from '../interface/wss.interface';

enum WssMethods {
  Enviar = 'WebServices_API.Publicadores.Wss.Messages.aEnviar.aspx',
}

@Injectable()
export class WssManagerService {
  constructor(private readonly httpService: HttpService) {}

  async sendWss(structure: IWssRequest): Promise<IWssResponse> {
    try {
      const url = process.env.CERTIMAILS_URL + WssMethods.Enviar;
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': structure.ApiKey,
      };

      const payload = JSON.stringify(structure);
      const response = await firstValueFrom(this.httpService.post(url, payload, { headers }));

      if (response.data.HasError) {
        throw new InternalServerErrorException(response.data.ErrMessage);
      }

      return response.data.Response;
    } catch (error) {
      return {
        HasError: true,
        ErrMessage: error.message,
      } as IWssResponse;
    }
  }
}
