import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { findOrganizationProductByKeyEvent } from '../../../main/vudec/organizations/organization-product/constants/events.constants';
import { findOrganizationByIdEvent } from '../../../main/vudec/organizations/organization/constants/events.constants';
import { findProductByIdEvent } from '../../../main/vudec/product/constants/events.constants';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';
import { CustomHeaders } from '../enum/custom-headers';

@Injectable()
export class OrganizationProductInterceptor implements NestInterceptor {
  constructor(private readonly eventEmitter: EventEmitter2) { }


  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ContextUtils.getRequest(context);
    const apiKey = req.headers[CustomHeaders.Apikey];
    if (apiKey) {
      const [organizationProduct] = await this.eventEmitter.emitAsync(findOrganizationProductByKeyEvent, {
        context,
        key: apiKey,
      });
      if (organizationProduct) {
        const organization = await organizationProduct.organization;

        const product = await organizationProduct.product;

        if (organization && product) {
          req.organizationProduct = organizationProduct;
          req.organization = organization;
          req.product = product;
        }
      }
    } else {
      const productId = req.headers[CustomHeaders.ProductId];
      const organizationId = req.headers[CustomHeaders.OrganizationId];

      if (productId) {
        const [product] = await this.eventEmitter.emitAsync(findProductByIdEvent, {
          context,
          id: productId,
        });

        req.product = product;
      }
      if (organizationId) {
        const [organization] = await this.eventEmitter.emitAsync(findOrganizationByIdEvent, {
          context,
          id: organizationId,
        });

        req.organization = organization;
      }
    }
    return next.handle().pipe();
  }
}
