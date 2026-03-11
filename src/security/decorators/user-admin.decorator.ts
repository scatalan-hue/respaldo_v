import { UseInterceptors } from '@nestjs/common';
import { UserAdminInterceptor } from '../interceptors/user-admin.interceptor';

export const UserAdmin = () => UseInterceptors(UserAdminInterceptor);
