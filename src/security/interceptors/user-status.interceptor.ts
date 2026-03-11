import { Observable } from 'rxjs';
import { UserStatusTypes } from '../users/enums/status-type.enum';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { ContextUtils } from '../../patterns/crud-pattern/utils/context.utils';

@Injectable()
export class UserStatusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let status;

    try {
      const req = ContextUtils.getRequest(context);

      if (!req || !req.user) throw new BadRequestException('Invalid user object in the request.');

      status = req.user.status;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong, please contact your system administrator.');
    }

    return next.handle();
  }
}
