import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BaseService {
  constructor(private readonly configService: ConfigService) {}

  getBaseUrl(): string {
    const port = this.configService.get<number>('APP_PORT') || 3000;
    const baseUrl = `${this.configService.get<string>('APP_URL') || 'http://localhost'}:${port}`;
    return baseUrl;
  }
}
