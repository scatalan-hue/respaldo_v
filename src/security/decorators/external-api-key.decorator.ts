import { UseInterceptors } from '@nestjs/common';
import { ExternalApikeyInterceptor } from '../interceptors/external-api-key.interceptor';

export const ExternalApiKey = () => UseInterceptors(ExternalApikeyInterceptor);
