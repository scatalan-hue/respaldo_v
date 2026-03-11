[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Organization Module Documentation] 

# **Module: Organization**

## **Description**

The Organization module is a fundamental component of the VUDEC system that manages all information related to organizations. This module provides comprehensive functionality for organization management, including CRUD operations, file handling for organization logos, and relationships with products, users, and taxpayers. The module is designed to integrate with other system components such as the organization product module, organization user module, and organization taxpayer module. It implements a robust architecture that ensures data consistency, security, and efficient data access patterns.

## **Features**

### **Example - Organization Management**
* Create, edit, and delete organizations
* Manage organization logos and file attachments
* Track organization hierarchy and relationships
* Handle organization product associations
* Manage organization user assignments
* Validate organization information
* Implement data integrity checks
* Maintain audit trails
* Support organization categorization by type

## **Controllers**
Located in `controllers/organization.controller.ts`

#### Dependencies
- `OrganizationService`: Service for handling organization operations
- `OrganizationViewService`: Service for handling organization view operations

#### Endpoints

##### POST /createOrganization
This endpoint allows creating or updating an organization and managing its associated products.

**Base URL**: `https://nodejs.softwaretributario.com:7045/createOrganization`

**Header Requirements:**
* **Content-Type**: application/json

**Input Parameters (Request Body)**

The body must be a JSON with the following structure:

```json
{
  "name": "string",
  "nit": "string",
  "ordenType": "DEPARTMENT | MUNICIPALITY | CENTRALIZEENTITY",
  "departmentCode": "number",
  "address": "string",
  "description": "string",
  "schedule": "string",
  "cityCode": "number",
  "email": "string",
  "phone": "string",
  "logoInput": {
    "fileId": "string",
    "fileUrl": "string",
    "fileBase64": "string",
    "filename": "string"
  },
  "organizationParentNit": "uuid",
  "products": [
    {
      "name": "Swit | Siiafe | Digisign | Govco",
      "description": "string",
      "url": "string",
      "urlTest": "string",
      "logoInput": {
        "fileId": "string",
        "fileUrl": "string",
        "fileBase64": "string",
        "filename": "string"
      }
    }
  ]
}
```

###### **Organization Fields:**

* `name` *(string, required)*: Organization name.
* `nit` *(string, required)*: Tax identification number. If it already exists, returns the existing organization.
* `ordenType` *(enum, required)*: Order type (DEPARTMENT, MUNICIPALITY, CENTRALIZEENTITY).
* `departmentCode` *(number, optional)*: Department code.
* `cityCode` *(number, optional)*: City code.
* `email` *(string, optional)*: Organization email.
* `phone` *(string, optional)*: Organization phone.
* `description`*(string, optional)*: Organization description.
* `schedule`*(string, optional)*: Organization schedule.
* `address`*(string, optional)*: Organization address.

###### **Logo Field for Organization (`logoInput`)**

The `logoInput` field allows attaching a logo, using one of the following configurations:

* `fileId`: Existing file ID.
* `fileBase64` and `filename`: Plain Base64 of the file and name without extension.
* `fileUrl`: Direct URL of the file.

Examples of valid configuration:

```json
"logoInput": {
  "fileId": "uuid"
}
```

```json
"logoInput": {
  "fileBase64": "iVBORw0KGgoAAAANSUhEUgAAA...",
  "filename": "logo"
}
```

```json
"logoInput": {
  "fileUrl": "https://vudec.com/files/logo.png"
}
```

###### **Product Fields (Associated with the Organization)**

* `products` *(array of* `CreateProductInput`, optional): List of products.
  * `name` *(enum, required)*: Product name (SWIT, SIIAFE, DIGISIGN, GOVCO).
  * `description` *(string, optional)*: Product description.
  * `logoInput` *(optional)*: Product logo (same rules as the organization logo).
  * `url`*(optional)*: Product URL.
  * `urlTest`*(optional)*: Test URL for the product.

**Service Logic:**

* **Organization Creation**:
  * If the NIT exists, the existing organization is returned.
  * If not, a new organization is created.
* **Product Association**:
  * If the product already exists (by `name`), it is directly associated.
  * If not, it is created and then associated.
* **Logo Association**:
  * Only one configuration type (`fileId`, `fileBase64` and `filename`, or `fileUrl`) is allowed per request.

**Successful Response (Code 200 - OK)**:
```json
{
  "id": "E669371D-93AD-EF11-B4C6-709CD10A7770",
  "name": "GUADALAJARA DE BUGA",
  "nit": "994567222",
  "products": [
    {
      "id": "0D0AF98F-90A3-EF11-B4C6-709CD10A7770",
      "name": "SIIAFE",
      "key": "$2b$10$pUkhquVQUYYnkIvVUZEnfOzSPhH55P.rFNaM6Xxa8SdWEDB7YnCjy"
    },
    {
      "id": "6C0F14FC-30B6-EF11-B9F8-C87F5406F554",
      "name": "SWIT",
      "key": "$2b$10$dPA.1sdS7IqywB9lrHMIh.Esz97iq4Uz/4/a50q5Bv39Kb8IInkmy"
    }
  ]
}
```

**Important Note:**
* The key returned in each product is the api-key which we will use to connect to vudec from an external application.

##### POST /organization/reportOrganizations
Generates and downloads an Excel report containing organization information based on specified filters.

**Request Details:**
- **Method:** POST
- **Path:** /organization/reportOrganizations
- **Content-Type:** application/json
- **Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  where?: {
    id?: StringFilter;
    nit?: StringFilter;
    name?: StringFilter;
    ordenType?: StringFilter;
    departmentCode?: StringFilter;
    cityCode?: StringFilter;
    // ... other filters
  };
  // ... other parameters
}
```

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/organization.resolver.ts`

#### GraphQL Operations

##### Queries

###### organization
```graphql
query Organization($id: ID!) {
  organization(id: $id) {
    id
    name
    nit
    ordenType
    departmentCode
    cityCode
    email
    phone
    description
    schedule
    address
    organizationProduct {
      id
      name
    }
    logo {
      id
      url
    }
  }
}
```
- **Description:** Retrieves a specific organization by ID, including basic information, logo, and associated products.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the organization to retrieve
- **Returns:** Promise<Organization> - Returns the found organization

###### Example Usage
```graphql
# Example GraphQL query
query {
  organization(id: "org-123") {
    id
    name
    nit
    ordenType
    logo {
      id
      url
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "organization": {
      "id": "org-123",
      "name": "Example Organization",
      "nit": "123456789",
      "ordenType": "MUNICIPALITY",
      "logo": {
        "id": "file-123",
        "url": "https://example.com/logo.png"
      }
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/organization.service.ts`

#### Dependencies
- `FilesService`: Service for handling file operations
- `Repository<Organization>`: TypeORM repository for organization entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### findOrCreate
```typescript
async findOrCreate(context: IContext, createInput: CreateOrganizationInput): Promise<Organization>
```
- **Description:** Finds an existing organization or creates a new one if none exists. This method ensures unique organization NITs and handles organization creation with proper validation.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createInput`: CreateOrganizationInput with organization data
- **Returns:** Promise<Organization> - Returns the found or created organization
- **Features:**
  - NIT uniqueness validation
  - Automatic creation if not exists
  - Context validation
  - Input validation

###### Example Usage
```typescript
const organization = await organizationService.findOrCreate(context, {
  name: 'Example Organization',
  nit: '123456789',
  ordenType: 'MUNICIPALITY'
});
```

###### Example Response
```typescript
{
  id: 'org-123',
  name: 'Example Organization',
  nit: '123456789',
  ordenType: 'MUNICIPALITY',
  logo: null,
  organizationProducts: [],
  createdAt: '2024-03-20T12:00:00Z',
  updatedAt: '2024-03-20T12:00:00Z'
}
```

##### createOrganizationWithProducts
```typescript
async createOrganizationWithProducts(context: IContext, input: RequestCreateOrganization): Promise<OrganizationWithProductsResponse>
```
- **Description:** Creates an organization with associated products. This method handles the creation of an organization and its relationships with products, ensuring proper data integrity.
- **Parameters:**
  - `context`: IContext object containing request context
  - `input`: RequestCreateOrganization with organization and product data
- **Returns:** Promise<OrganizationWithProductsResponse> - Returns the created organization with products
- **Features:**
  - Organization creation
  - Logo management
  - Product association
  - Key generation for products

###### Example Usage
```typescript
const organizationWithProducts = await organizationService.createOrganizationWithProducts(context, {
  name: 'Example Organization',
  nit: '123456789',
  ordenType: 'MUNICIPALITY',
  products: [
    {
      name: 'SWIT',
      description: 'SWIT product'
    }
  ]
});
```

###### Example Response
```typescript
{
  id: 'org-123',
  name: 'Example Organization',
  nit: '123456789',
  products: [
    {
      id: 'prod-123',
      name: 'SWIT',
      key: '$2b$10$dPA.1sdS7IqywB9lrHMIh.Esz97iq4Uz/4/a50q5Bv39Kb8IInkmy'
    }
  ]
}
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup
- `afterCreate`: Post-creation operations

#### Event Handlers

##### onFindOrganizationByIdEvent
```typescript
@OnEvent(findOrganizationByIdEvent)
async onFindOrganizationByIdEvent(payload: { context: IContext; id: string }): Promise<Organization>
```
- **Description:** Event handler for finding an organization by ID. This handler is triggered when an organization needs to be retrieved by its unique identifier.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the organization to find
- **Returns:** Promise<Organization> - Returns the found organization
- **Features:**
  - Error handling for not found cases
  - Context validation
  - Relationship management

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrganizationByIdEvent, {
  context,
  id: 'org-123'
});
```

###### Example Response
```typescript
{
  id: 'org-123',
  name: 'Example Organization',
  nit: '123456789',
  ordenType: 'MUNICIPALITY'
}
```

##### onFindOrganizationByNitEvent
```typescript
@OnEvent(findOrganizationByNitEvent)
async onFindOrganizationByNitEvent(payload: { context: IContext; nit: string }): Promise<Organization>
```
- **Description:** Event handler for finding an organization by NIT. This handler is triggered when an organization needs to be retrieved by its tax identification number.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.nit`: NIT of the organization to find
- **Returns:** Promise<Organization> - Returns the found organization
- **Features:**
  - Error handling for not found cases
  - Context validation
  - NIT validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrganizationByNitEvent, {
  context,
  nit: '123456789'
});
```

###### Example Response
```typescript
{
  id: 'org-123',
  name: 'Example Organization',
  nit: '123456789',
  ordenType: 'MUNICIPALITY'
}
```

## **Data Layer (Models and Structures)**

### **Entities**
Located in `models/organization.entity.ts`

#### Organization
- **Description:** Represents an organization in the system
- **Properties:**
  - `id`: UUID primary key
  - `name`: Organization name
  - `nit`: Tax identification number
  - `ordenType`: Type of order (enum)
  - `departmentCode`: Department code
  - `cityCode`: City code
  - `email`: Organization email
  - `phone`: Organization phone
  - `description`: Organization description
  - `schedule`: Organization schedule
  - `address`: Organization address
  - `logo`: Relation to File
  - `organizationProducts`: Relation to OrganizationProduct[]
  - `organizationUsers`: Relation to OrganizationUser[]
  - `organizationTaxpayers`: Relation to OrganizationTaxpayer[]
  - `parentId`: Parent organization ID
  - `parent`: Relation to parent Organization
  - `children`: Relation to child Organizations
  - `createdAt`: Creation timestamp
  - `updatedAt`: Update timestamp

#### OrganizationView
- **Description:** Represents a read-only view of organizations with additional calculated fields
- **Properties:**
  - All properties from Organization
  - `productCount`: Number of associated products
  - `userCount`: Number of associated users
  - `taxpayerCount`: Number of associated taxpayers
  - `contractCount`: Number of associated contracts

### **DTOs**
Located in `dto/organization.dto.ts`

#### CreateOrganizationInput
- **Description:** Input DTO for creating an organization
- **Properties:**
  - `name`: Organization name (required)
  - `nit`: Tax identification number (required)
  - `ordenType`: Type of order (required)
  - `departmentCode`: Department code (optional)
  - `cityCode`: City code (optional)
  - `email`: Organization email (optional)
  - `phone`: Organization phone (optional)
  - `description`: Organization description (optional)
  - `schedule`: Organization schedule (optional)
  - `address`: Organization address (optional)
  - `logoInput`: Input for logo file (optional)
  - `organizationParentNit`: Parent organization NIT (optional)

#### UpdateOrganizationInput
- **Description:** Input DTO for updating an organization
- **Properties:**
  - `name`: Organization name (optional)
  - `nit`: Tax identification number (optional)
  - `ordenType`: Type of order (optional)
  - `departmentCode`: Department code (optional)
  - `cityCode`: City code (optional)
  - `email`: Organization email (optional)
  - `phone`: Organization phone (optional)
  - `description`: Organization description (optional)
  - `schedule`: Organization schedule (optional)
  - `address`: Organization address (optional)
  - `logoInput`: Input for logo file (optional)
  - `organizationParentNit`: Parent organization NIT (optional)

#### RequestCreateOrganization
- **Description:** Request DTO for creating an organization with products
- **Properties:**
  - All properties from CreateOrganizationInput
  - `products`: Array of CreateProductInput (optional)
  - Additional validation rules for API requests

### **Enums**
Located in `enums/organization.enum.ts`

#### OrdenType
- **Description:** Enumeration for organization order types
- **Values:**
  - `DEPARTMENT`: Department level organization
  - `MUNICIPALITY`: Municipality level organization
  - `CENTRALIZEENTITY`: Centralized entity

## **Constants**

### **Event Constants**
Located in `constants/organization.constant.ts`

```typescript
export const findOrganizationByIdEvent = 'findOrganizationById';
export const findOrganizationByNitEvent = 'findOrganizationByNit';
export const createOrganizationWithProductsEvent = 'createOrganizationWithProducts';
export const findOrCreateOrganizationEvent = 'findOrCreateOrganization';
```

## **Utilities**

### **Organization Report Generator**
Located in `utils/organization-report.util.ts`

- **Description:** Utility for generating Excel reports from organization data
- **Features:**
  - Excel file generation
  - Cell formatting
  - Header creation
  - Data export

## **API & Integration Points**

### **External Services Integration**
- **File Service:** Organizations can have logo files stored and managed
- **Excel Export:** Organization data can be exported to Excel format
- **Event-based Communication:** Organizations interact with other modules through events

## **Error Handling & Validation**

### **Common Errors**
- **Duplicate NIT:** When trying to create an organization with an existing NIT
- **Invalid Order Type:** When the order type is not one of the allowed values
- **Missing Required Fields:** When required fields are not provided
- **Invalid File Format:** When the logo file format is not supported

### **Validation Strategies**
- **Entity-level Validation:** Validates organization entities
- **Input Validation:** Validates input DTOs
- **Business Logic Validation:** Validates business rules

## **Performance Considerations**

### **Optimization Strategies**
- **Lazy Loading:** Relations are loaded on demand
- **Selective Field Selection:** Only required fields are retrieved
- **Pagination:** Results are paginated for better performance
- **Indexing:** Key fields are indexed for faster search 