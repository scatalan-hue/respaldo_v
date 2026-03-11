[Home](../../../../../README.md) > [Main Module Documentation](../../../docs/main.md) > [Product Module Documentation]

# **Module: Product**

## **Description**

The Product module is a fundamental component of the VUDEC system that manages all information related to products. This module provides comprehensive functionality for product management, including CRUD operations, file handling for product logos, and organization product relationships. The module is designed to integrate with other system components such as the organization product module and file management system. It implements a robust architecture that ensures data consistency, security, and efficient data access patterns.

## **Features**

### **Example - Product Management**
* Create, edit, and delete products
* Manage product logos and file attachments
* Track product status and availability
* Handle organization product relationships
* Validate product information
* Implement data integrity checks
* Maintain audit trails
* Support product categorization

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/product.resolver.ts`

#### GraphQL Operations

##### Queries

###### product
```graphql
query Product($id: ID!) {
  product(id: $id) {
    id
    name
    description
    status
    logo {
      id
      url
    }
    organizationProducts {
      id
      organization {
        id
        name
      }
    }
  }
}
```
- **Description:** Retrieves a specific product by ID, including basic information, logo, and associated organizations.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the product to retrieve
- **Returns:** Promise<Product> - Returns the found product

###### Example Usage
```graphql
# Example GraphQL query
query {
  product(id: "prod-123") {
    id
    name
    description
    status
    logo {
      id
      url
    }
    organizationProducts {
      id
      organization {
        id
        name
      }
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "product": {
      "id": "prod-123",
      "name": "SERVICE",
      "description": "Service product for organizations",
      "status": "ACTIVE",
      "logo": {
        "id": "file-123",
        "url": "https://example.com/logo.png"
      },
      "organizationProducts": [
        {
          "id": "org-prod-123",
          "organization": {
            "id": "org-123",
            "name": "Example Organization"
          }
        }
      ]
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/product.service.ts`

#### Dependencies
- `FilesService`: Service for handling file operations
- `Repository<Product>`: TypeORM repository for product entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### findOrCreate
```typescript
private async findOrCreate(context: IContext, createInput: CreateProductInput): Promise<Product>
```
- **Description:** Finds an existing product or creates a new one if none exists. This method ensures unique product names and handles product creation with proper validation.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createInput`: CreateProductInput with product data
- **Returns:** Promise<Product> - Returns the found or created product
- **Features:**
  - Name uniqueness validation
  - Automatic creation if not exists
  - Context validation
  - Input validation

###### Example Usage
```typescript
const product = await productService.findOrCreate(context, {
  name: 'SERVICE',
  description: 'Service product for organizations',
  status: 'ACTIVE'
});
```

###### Example Response
```typescript
{
  id: 'prod-123',
  name: 'SERVICE',
  description: 'Service product for organizations',
  status: 'ACTIVE',
  logo: null,
  organizationProducts: [],
  createdAt: '2024-03-20T12:00:00Z',
  updatedAt: '2024-03-20T12:00:00Z'
}
```

##### findOrCreateProducts
```typescript
async findOrCreateProducts(context: IContext, productInputs: CreateProductInput[]): Promise<Product[]>
```
- **Description:** Finds or creates multiple products in batch. This method handles multiple product operations efficiently.
- **Parameters:**
  - `context`: IContext object containing request context
  - `productInputs`: Array of CreateProductInput with product data
- **Returns:** Promise<Product[]> - Returns array of found or created products
- **Features:**
  - Batch processing
  - Parallel execution
  - Name uniqueness validation
  - Context validation

###### Example Usage
```typescript
const products = await productService.findOrCreateProducts(context, [
  {
    name: 'SERVICE',
    description: 'Service product'
  },
  {
    name: 'PRODUCT',
    description: 'Physical product'
  }
]);
```

###### Example Response
```typescript
[
  {
    id: 'prod-123',
    name: 'SERVICE',
    description: 'Service product',
    status: 'ACTIVE',
    logo: null,
    organizationProducts: []
  },
  {
    id: 'prod-124',
    name: 'PRODUCT',
    description: 'Physical product',
    status: 'ACTIVE',
    logo: null,
    organizationProducts: []
  }
]
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup
- `beforeMutation`: Pre-mutation validation and setup

#### Event Handlers

##### onFindOrCreateProductsEvent
```typescript
@OnEvent(findOrCreateProductsEvent)
async onFindOrCreateProductsEvent({ context, productInputs }: { context: IContext; productInputs: CreateProductInput[] }): Promise<Product[]>
```
- **Description:** Event handler for finding or creating multiple products. This handler manages batch product operations through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.productInputs`: Array of CreateProductInput with product data
- **Returns:** Promise<Product[]> - Returns array of found or created products
- **Features:**
  - Batch processing
  - Event-based execution
  - Name uniqueness validation
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrCreateProductsEvent, {
  context,
  productInputs: [
    {
      name: 'SERVICE',
      description: 'Service product'
    },
    {
      name: 'PRODUCT',
      description: 'Physical product'
    }
  ]
});
```

###### Example Response
```typescript
[
  {
    id: 'prod-123',
    name: 'SERVICE',
    description: 'Service product',
    status: 'ACTIVE',
    logo: null,
    organizationProducts: []
  },
  {
    id: 'prod-124',
    name: 'PRODUCT',
    description: 'Physical product',
    status: 'ACTIVE',
    logo: null,
    organizationProducts: []
  }
]
```

##### onFindOrCreateProductEvent
```typescript
@OnEvent(findOrCreateProductEvent)
async onFindOrCreateProductEvent({ context, productInput }: { context: IContext; productInput: CreateProductInput }): Promise<Product>
```
- **Description:** Event handler for finding or creating a single product. This handler manages individual product operations through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.productInput`: CreateProductInput with product data
- **Returns:** Promise<Product> - Returns the found or created product
- **Features:**
  - Name uniqueness validation
  - Event-based execution
  - Context validation
  - Input validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrCreateProductEvent, {
  context,
  productInput: {
    name: 'SERVICE',
    description: 'Service product for organizations',
    status: 'ACTIVE'
  }
});
```

###### Example Response
```typescript
{
  id: 'prod-123',
  name: 'SERVICE',
  description: 'Service product for organizations',
  status: 'ACTIVE',
  logo: null,
  organizationProducts: []
}
```

##### onFindOneProductById
```typescript
@OnEvent(findProductByIdEvent)
async onFindOneProductById({ context, id }: { context: IContext; id: string }): Promise<Product>
```
- **Description:** Event handler for finding a product by ID. This handler manages product retrieval through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the product to find
- **Returns:** Promise<Product> - Returns the found product
- **Features:**
  - Error handling for not found cases
  - Event-based execution
  - Context validation
  - Product existence validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findProductByIdEvent, {
  context,
  id: 'prod-123'
});
```

###### Example Response
```typescript
{
  id: 'prod-123',
  name: 'SERVICE',
  description: 'Service product for organizations',
  status: 'ACTIVE',
  logo: {
    id: 'file-123',
    url: 'https://example.com/logo.png'
  },
  organizationProducts: [
    {
      id: 'org-prod-123',
      organization: {
        id: 'org-123',
        name: 'Example Organization'
      }
    }
  ]
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/products.entity.ts`

#### Database Table
- **Table Name:** vudec_product
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| name | ProductName | Yes | Unique product name | ProductName |
| description | string | Yes | Product description | String |
| status | ProductStatus | No | Product status | ProductStatus |

#### Relationships

##### Logo
```typescript
@JoinColumn()
@OneToOne(() => FileInfo, (logo) => logo.id, {
  lazy: true,
  eager: true,
  nullable: true,
})
@Field(() => FileInfo, { nullable: true })
logo?: FileInfo;
```
- **Type:** One-to-One
- **Related Entity:** FileInfo
- **Description:** Links product to its logo file
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

##### OrganizationProducts
```typescript
@OneToMany(() => OrganizationProduct, (organizationProduct) => organizationProduct.product, {
  lazy: true,
  nullable: true,
})
@Field(() => [OrganizationProduct], { nullable: true })
organizationProducts?: OrganizationProduct[];
```
- **Type:** One-to-Many
- **Related Entity:** OrganizationProduct
- **Description:** Links product to organizations
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

### **Enums (Enumerations)**
Located in `enum/product-name.enum.ts` and `enum/product-status.enum.ts`

#### ProductName
##### Description
Defines the available product names in the system. This enumeration ensures consistency in product naming across the application.

#### ProductStatus
##### Description
Defines the possible states of a product in the system. This enumeration manages the lifecycle of products.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| Active | Product is available for use | Default state for new products |
| Inactive | Product is not available | Temporarily disabled products |

### **Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for event handling in the product module. These constants are used to identify different types of product-related events in the system.

#### Values
```typescript
export const findProductByIdEvent = 'findProductByIdEvent';
export const findOrCreateProductsEvent = 'findOrCreateProductsEvent';
export const findOrCreateProductEvent = 'findOrCreateProductEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger product search operations
- Handle product creation and updates
- Manage event-based communication between different parts of the system 