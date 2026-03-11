import { UseInterceptors } from '@nestjs/common';
import { UserStatusInterceptor } from '../interceptors/user-status.interceptor';

export const UserStatus = () => UseInterceptors(UserStatusInterceptor);
