import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../users/entities/user.entity';
import { UserTypes } from '../../users/enums/user-type.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { USER_TYPES_KEY } from '../decorators/user-types.decorator';
import { ExtendedExecutionContext } from '../interfaces/functionality.interface';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';

export class SecurityAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    return ContextUtils.getRequest(context);
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) {
      ContextUtils.getRequest(context).isPublic = true;

      // if(err || !user)
      //     return undefined;

      return undefined;
    }

    if (user instanceof User) {
      const validTypes = this.reflector.get<UserTypes>(USER_TYPES_KEY, context.getHandler());

      if (validTypes?.length !== 0 && user.type != UserTypes.SuperAdmin && !validTypes?.includes(user.type))
        throw new ForbiddenException(`User '${user.name}' with type: [${user.type}], is not allowed to perform this action`);
    }

    (context as ExtendedExecutionContext).user = user;

    return super.handleRequest(err, user, info, context, status);
  }
}
