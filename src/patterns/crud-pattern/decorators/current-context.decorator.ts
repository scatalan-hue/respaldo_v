import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IContext } from '../interfaces/context.interface';
import { ContextUtils } from '../utils/context.utils';

export const CurrentContext = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = ContextUtils.getRequest(context);

  const user = request.user;
  const organization = request.organization;
  const product = request.product;
  const transactionManager = request.transactionManager;
  const ip = request.ip;
  const organizationProduct = request.organizationProduct;

  const currentContext: IContext = {
    user,
    organization,
    transactionManager,
    ip,
    organizationProduct,
    product,
  };

  return currentContext;
});
