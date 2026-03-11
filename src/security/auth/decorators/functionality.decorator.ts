import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { FunctionalityGuard } from '../guards/functionality.guard';
import { FunctionalityModel } from '../../functionalities/functionality/types/functionality.type';

export const FUNCTIONALITY_KEY = 'functionality';

const RolesFx = (functionality: FunctionalityModel) => SetMetadata(FUNCTIONALITY_KEY, functionality);

export function Functionality(key: any) {
  return () => applyDecorators(RolesFx(key), UseGuards(FunctionalityGuard));
}

export function FunctionalityResolver(key: any) {
  return Functionality(key)();
}
