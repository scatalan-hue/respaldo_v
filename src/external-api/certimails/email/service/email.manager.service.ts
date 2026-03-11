import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IEmailResponse, IEmailRequest } from '../interface/email.interface';
import { IExternalTemplateRequest, IExternalTemplateResponse } from '../interface/template.interface';

enum EmailMethod {
  Send = 'rest/WebServices_API/Publicadores/Email/Enviar',
  Templates = 'WebServices_API.Publicadores.Template.aObtenerPlantilla.aspx',
}

@Injectable()
export class EmailManagerService {
  constructor(private readonly httpService: HttpService) {}

  async sendEmail(structure: IEmailRequest): Promise<IEmailResponse> {
    try {
      const url = process.env.CERTIMAILS_URL + EmailMethod.Send;
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': structure.ApiKey,
      };
      const payload = '{ "Request": ' + JSON.stringify(structure) + '}';
      const response = await firstValueFrom(this.httpService.post(url, payload, { headers }));

      if (response.data.Response.HasError) {
        throw new InternalServerErrorException(response.data.Response.ErrMessage);
      }

      return response.data.Response;
    } catch (error) {
      return {
        HasError: true,
        ErrMessage: error.message,
      } as IEmailResponse;
    }
  }

  async getTemplates(structure: IExternalTemplateRequest): Promise<IExternalTemplateResponse[]> {
    try {
      const url = process.env.CERTIMAILS_URL + EmailMethod.Templates;
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': structure.ApiKey,
      };
      const payload = JSON.stringify(structure);
      const response = await firstValueFrom(this.httpService.post(url, payload, { headers }));

      if (response.data.HasError) {
        throw new InternalServerErrorException(response.data.ErrMessage);
      }

      return response.data.Plantillas;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
