import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateProfileInput } from '../dto/inputs/create-profile.input';

enum profileMethod {
  Require = 'rest/WebServices_API/Publicadores/Cliente/Requerir',
}

@Injectable()
export class ProfileManagerService {
  constructor(private readonly httpService: HttpService) {}

  async createProfile(createInput: CreateProfileInput): Promise<string> {
    try {
      const payload = JSON.stringify({
        Request: {
          Information: {
            CorreoElectronico: createInput.email,
            Nombres: createInput.firstName,
            Apellidos: createInput.lastName,
            Telefono: createInput.phone,
            Departamento: createInput.region,
            Municipio: createInput.city,
            NumeroDocumento: createInput.document,
          },
        },
      });
      const url = process.env.CERTIMAILS_URL + profileMethod.Require;
      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers,
        }),
      );
      const resp = response?.data?.Response;
      if (!resp) throw new Error('Invalid response from Certimails');
      if (resp.HasError) throw new Error(String(resp.ErrMessage || 'Certimails error'));
      return String(resp.ApiKey || '').trim();
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while trying to create Certimails profile: ' + error);
    }
  }
}
