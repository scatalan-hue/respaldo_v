[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Organization User Module Documentation]

# Organization User Module

## Description
The Organization User module is a component of the VUDEC system that manages the relationship between organizations and users. This module allows the association of users with organizations, facilitating the management of permissions and roles within each organization.

## Features
- Management of organization-user associations
- Validation of existing users and organizations
- Audit tracking
- Management of descriptions for each association

## Controllers / Resolvers / Producers

### GraphQL Operations

#### Query: organizationUser
```graphql
query GetOrganizationUser($id: String!) {
  organizationUser(id: $id) {
    id
    description
    organization {
      id
      name
    }
    user {
      id
      name
    }
  }
}
```

## Services

### Core Methods

### Lifecycle Hooks

#### beforeCreate
```typescript
async beforeCreate(context: IContext, repository: Repository<OrganizationUser>, entity: OrganizationUser, createInput: CreateOrganizationUserInput): Promise<void>
```
Executed before creating a new organization-user association.

#### beforeUpdate
```typescript
async beforeUpdate(context: IContext, repository: Repository<OrganizationUser>, entity: OrganizationUser, updateInput: UpdateOrganizationUserInput): Promise<void>
```
Executed before updating an existing association.

### Event Handlers

#### onCreateOrganizationUser
```typescript
async onCreateOrganizationUser({ context, createInput }: { context: IContext; createInput: CreateOrganizationUserInput }): Promise<OrganizationUser>
```
Handles the creation of a new organization-user association.

#### onFindOrganizationUser
```typescript
async onFindOrganizationUser({ context, organizationId, userId }: { context: IContext; organizationId: string; userId: string }): Promise<OrganizationUser>
```
Handles finding an organization-user association by organization and user ID.

## **Data Layer**

### **Table Structure**
Located in `entities/organization-user.entity.ts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | string | false | Primary key |
| description | string | true | User role or description in the organization |
| organizationId | string | false | Foreign key to Organization |
| userId | string | false | Foreign key to User |
| createdAt | Date | false | Creation timestamp |
| updatedAt | Date | false | Last update timestamp |
| createdBy | string | false | User who created the record |
| updatedBy | string | false | User who last updated the record |

### **Relationships**
- **Organization**: Many to one with Organization entity
- **User**: Many to one with User entity

### **Constants**
Located in `constants/events.constants.ts`

```typescript
export const createOrganizationUserEvent: string = 'createOrganizationUserEvent';
export const findOrganizationUserEvent: string = 'findOrganizationUserEvent';
``` 