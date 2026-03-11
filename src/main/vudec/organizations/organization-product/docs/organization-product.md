[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Organization Product Module Documentation]

# Organization Product Module

## Description
The Organization Product module is a component of the VUDEC system that manages the relationship between organizations and products. This module allows the association of products with organizations, including the configuration of keys, URLs, and specific profiles for each association.

## Features
- Management of organization-product associations
- Configuration of URLs and test URLs
- Association with Certimails profiles
- Management of related contracts and lots
- Validation of organization-product relationships
- Audit tracking

## Controllers / Resolvers / Producers

### GraphQL Operations

#### Query: organizationProduct
```graphql
query GetOrganizationProduct($id: String!) {
  organizationProduct(id: $id) {
    id
    key
    url
    urlTest
    description
    organization {
      id
      name
    }
    profile {
      id
      name
    }
    product {
      id
      name
    }
    contracts {
      id
      name
    }
    lots {
      id
      name
    }
  }
}
```

## Services

### Core Methods

#### findOrCreate
```typescript
async findOrCreate(context: IContext, input: CreateOrganizationProductInput): Promise<OrganizationProduct>
```
Creates a new organization-product association or finds an existing one.

**Parameters:**
- `context`: Operation context
- `input`: Data of the association to create/find

**Returns:**
- `OrganizationProduct`: Organization-product association

### Lifecycle Hooks

#### beforeCreate
```typescript
async beforeCreate(context: IContext, repository: Repository<OrganizationProduct>, entity: OrganizationProduct, createInput: CreateOrganizationProductInput): Promise<void>
```
Executed before creating a new association.

#### beforeUpdate
```typescript
async beforeUpdate(context: IContext, repository: Repository<OrganizationProduct>, entity: OrganizationProduct, updateInput: UpdateOrganizationProductInput): Promise<void>
```
Executed before updating an existing association.

### Event Handlers

#### onCreateOrganizationProduct
```typescript
async onCreateOrganizationProduct({ context, input }: { context: IContext; input: CreateOrganizationProductInput }): Promise<OrganizationProduct>
```
Handles the creation of a new organization-product association.

#### onCreateOrFindOrganizationProduct
```typescript
async onCreateOrFindOrganizationProduct({ context, input }: { context: IContext; input: CreateOrganizationProductInput }): Promise<OrganizationProduct>
```
Handles the creation or finding of an organization-product association.

#### onFindOrganizationProductByKey
```typescript
async onFindOrganizationProductByKey({ context, key }: { context: IContext; key: string }): Promise<OrganizationProduct>
```
Handles finding an association by key.

## **Data Layer**

### **Table Structure**
Located in `entities/organization-product.entity.ts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | string | false | Primary key |
| key | string | false | Unique identifier for the product |
| url | string | true | Product URL |
| urlTest | string | true | Test environment URL |
| description | string | true | Product description |
| organizationId | string | false | Foreign key to Organization |
| profileId | string | false | Foreign key to Profile (Certimails) |
| productId | string | false | Foreign key to Product |
| createdAt | Date | false | Creation timestamp |
| updatedAt | Date | false | Last update timestamp |
| createdBy | string | false | User who created the record |
| updatedBy | string | false | User who last updated the record |

### **Relationships**
- **Organization**: Many to one with Organization entity
- **Profile**: Many to one with Profile entity (Certimails)
- **Product**: Many to one with Product entity
- **Contract**: One to many with Contract entity
- **Lot**: One to many with Lot entity

### **Constants**
Located in `constants/events.constants.ts`

```typescript
export const createOrganizationProductEvent: string = 'createOrganizationProductEvent';
// export const createOrUpdateOrganizationProductEvent: string = 'createOrUpdateOrganizationProductEvent';
export const createOrFindOrganizationProductEvent: string = 'createOrFindOrganizationProductEvent';
export const findOrganizationProductByKeyEvent: string = 'findOrganizationProductByKeyEvent';
``` 