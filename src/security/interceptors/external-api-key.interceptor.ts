import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nService } from 'nestjs-i18n';
import { Observable, of } from 'rxjs';
import { I18N_SPACE } from '../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../common/i18n/functions/response';
import { findOrganizationProductByKeyEvent } from '../../main/vudec/organizations/organization-product/constants/events.constants';
import { ContextUtils } from '../../patterns/crud-pattern/utils/context.utils';
import { CustomHeaders } from '../auth/enum/custom-headers';

@Injectable()
export class ExternalApikeyInterceptor implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly i18nService: I18nService,
  ) {}

  private readonly I18N_SPACE = I18N_SPACE.Interceptor;

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ContextUtils.getRequest(context);

    if (!req.headers[CustomHeaders.Apikey]) throw new UnauthorizedException(sendResponse(context, this.I18N_SPACE, 'externalApikeyInterceptor.apikey'));

    const apiKey = req.headers[CustomHeaders.Apikey];

    // let [credentials] = await this.emmiter.emitAsync(findByApiKeyEvent, apiKey, { user: undefined });

    const [credentials] = await this.eventEmitter.emitAsync(findOrganizationProductByKeyEvent, {
      context,
      key: apiKey,
    });

    if (!credentials) throw new UnauthorizedException(sendResponse(context, this.I18N_SPACE, 'externalApikeyInterceptor.credentials'));

    req.organizationProduct = await credentials;

    req.organization = await credentials.organization;
    req.product = await credentials.product;

    return next.handle();
  }
}
