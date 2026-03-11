import { Observable } from 'rxjs';
import { BadRequestException, CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { UserTypes } from '../users/enums/user-type.enum';
import * as bcrypt from 'bcrypt';
import { ContextUtils } from '../../patterns/crud-pattern/utils/context.utils';

@Injectable()
export class UserAdminInterceptor implements NestInterceptor {
  constructor(private readonly userService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ContextUtils.getRequest(context);

    if (!req || !req.body) throw new BadRequestException('Invalid request.');

    const {
      body: {
        variables: { signInAdminInput },
      },
    } = req;

    const { email, password } = signInAdminInput;

    const user = await this.userService.findOneByEmail({ user: undefined }, email, false);

    if (!user || !bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials invalid');

    if (user.type === UserTypes.User) throw new ForbiddenException('You are not allowed to perform this action.');

    delete user.password;

    req.user = user;

    return next.handle();
  }
}
