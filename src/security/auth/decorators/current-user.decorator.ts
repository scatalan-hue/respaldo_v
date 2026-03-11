import { ExecutionContext, ForbiddenException, InternalServerErrorException, createParamDecorator } from '@nestjs/common';
import { UserTypes } from '../../users/enums/user-type.enum';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator((validTypes: UserTypes[] = [], context: ExecutionContext) => {
  const request = ContextUtils.getRequest(context);

  const { user, isPublic: isPublic }: { user: User; isPublic: boolean } = request;

  if (!isPublic) {
    if (!user) throw new InternalServerErrorException(`current user is undefined, check if CurrentPageVersionGuard is set to this controller`);

    // if (validTypes.length !== 0 && user.type != UserTypes.SuperAdmin && !validTypes.includes(user.type))
    //   throw new ForbiddenException(`User '${user.name}' with type: [${user.type}], is not allowed to perform this action`);
  }
  return user;
});
