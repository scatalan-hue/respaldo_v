import { registerEnumType } from '@nestjs/graphql';

export enum OrganizationStatus {
    Incomplete = 'INCOMPLETE',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE'
}

registerEnumType(OrganizationStatus, { name: 'OrganizationStatus' });
