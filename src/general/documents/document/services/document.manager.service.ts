import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

enum DocumentMethod {
  DocxCompiler = '/WebServices.Publicadores.Generar.Word.ARequest.aspx',
}

@Injectable()
export class DocumentManagerService {
  private readonly CONVERT_PDF_URL = process.env.CONVERT_PDF_URL;
  private readonly CONVERT_PDF_JWT = process.env.CONVERT_PDF_JWT;

  constructor(private readonly httpService: HttpService) {}

  async docxCompiler(base64: string, variables: any) {
    try {
      const url: string = this.CONVERT_PDF_URL + DocumentMethod.DocxCompiler;

      const payload = {
        DctBase64: base64,
        Conceptos: {
          ...variables,
        },
      };

      const headers = {
        Jwt: this.CONVERT_PDF_JWT,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers,
          responseType: 'arraybuffer',
        }),
      );

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
