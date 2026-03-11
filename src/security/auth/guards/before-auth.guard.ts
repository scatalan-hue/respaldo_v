import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { findOrganizationProductByKeyEvent } from '../../../main/vudec/organizations/organization-product/constants/events.constants';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';
import { CustomHeaders } from '../enum/custom-headers';

@Injectable()
export class BeforeSecurityAuthGuard implements CanActivate {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
  ) {}

  private readonly I18N_SPACE = I18N_SPACE.Interceptor;

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = ContextUtils.getRequest(context);
    const apiKey = req.headers[CustomHeaders.Apikey];

    if (apiKey) {
      // let [credentials] = await this.emmiter.emitAsync(findByApiKeyEvent, apiKey, { user: undefined });

      const [credentials] = await this.eventEmitter.emitAsync(findOrganizationProductByKeyEvent, {
        context,
        key: apiKey,
      });

      if (!credentials) throw new UnauthorizedException(sendResponse(context, this.I18N_SPACE, 'externalApikeyInterceptor.credentials'));

      if (req.headers.authorization) {
        const payload = await this.jwtService.verifyAsync(req.headers.authorization.split(' ')[1], {
          secret: process.env.JWT_SECRET,
          ignoreExpiration: false,
        });

        const newToken = this.jwtService.sign({
          application: payload.application,
          email: payload.email,
          username: payload.username,
          organization: (await credentials?.organization)?.identificationNumber,
          hasAuthorized: true,
          product: (await credentials?.product)?.name,
        });

        req.headers.authorization = `Bearer ${newToken}`;
      }
    }

    return true;
  }
}
