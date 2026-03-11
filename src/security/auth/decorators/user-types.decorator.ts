import { SetMetadata } from '@nestjs/common';
import { UserTypes } from '../../users/enums/user-type.enum';

export const USER_TYPES_KEY = 'roles';

export const SecureUserTypes = (...userTypes: UserTypes[]) => SetMetadata(USER_TYPES_KEY, userTypes);

export const AnyUserGuest = () => SecureUserTypes(UserTypes.User, UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.Public);

export const AnyUser = () => SecureUserTypes(UserTypes.User, UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.Public);

export const AdminOnly = () => SecureUserTypes(UserTypes.Admin, UserTypes.SuperAdmin);

export const SuperAdminOnly = () => SecureUserTypes(UserTypes.SuperAdmin);
