[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Organization Taxpayer Module Documentation]

# Organization Taxpayer Module

## Description
The Organization Taxpayer module is a component of the VUDEC system that manages the relationship between organizations and taxpayers. This module allows the association of taxpayers with organizations, facilitating the management of commercial and fiscal relationships.

## Features
- Management of organization-taxpayer associations
- Validation of existing taxpayers and organizations
- Audit tracking
- Management of descriptions for each association

## Controllers / Resolvers / Producers

### GraphQL Operations

#### Query: organizationTaxpayer
```graphql
query GetOrganizationTaxpayer($id: String!) {
  organizationTaxpayer(id: $id) {
    id
    description
    organization {
      id
      name
    }
    taxpayer {
      id
      name
    }
  }
}
```

## Services

### Core Methods

#### findOrCreateOrganizationTaxpayer
```typescript
async findOrCreateOrganizationTaxpayer(context: IContext, input: CreateOrganizationTaxpayerInput): Promise<OrganizationTaxpayer>
```
Creates a new organization-taxpayer association or finds an existing one.

**Parameters:**
- `context`: Operation context
- `input`: Data of the association to create/find

**Returns:**
- `OrganizationTaxpayer`: Organization-taxpayer association

### Lifecycle Hooks

#### beforeCreate
```typescript
async beforeCreate(context: IContext, repository: Repository<OrganizationTaxpayer>, entity: OrganizationTaxpayer, createInput: CreateOrganizationTaxpayerInput): Promise<void>
```
Executed before creating a new association.

#### beforeUpdate
```typescript
async beforeUpdate(context: IContext, repository: Repository<OrganizationTaxpayer>, entity: OrganizationTaxpayer, updateInput: UpdateOrganizationTaxpayerInput): Promise<void>
```
Executed before updating an existing association.

### Event Handlers

#### onFindOrCreateOrganizationTaxpayer
```typescript
async onFindOrCreateOrganizationTaxpayer({ context, input }: { context: IContext; input: CreateOrganizationTaxpayerInput }): Promise<OrganizationTaxpayer>
```
Handles the creation or finding of an organization-taxpayer association.

## **Data Layer**

### **Table Structure**
Located in `entities/organization-taxpayer.entity.ts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | string | false | Primary key |
| description | string | true | Taxpayer role or description in the organization |
| organizationId | string | false | Foreign key to Organization |
| taxpayerId | string | false | Foreign key to Taxpayer |
| createdAt | Date | false | Creation timestamp |
| updatedAt | Date | false | Last update timestamp |
| createdBy | string | false | User who created the record |
| updatedBy | string | false | User who last updated the record |

### **Relationships**
- **Organization**: Many to one with Organization entity
- **Taxpayer**: Many to one with Taxpayer entity

### **Constants**
Located in `constants/events.constants.ts`

```typescript
export const findOrCreateOrganizationTaxpayerEvent: string = 'findOrCreateOrganizationTaxpayerEvent';
``` 