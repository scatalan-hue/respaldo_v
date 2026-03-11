[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Document Type Module Documentation]

# **Module: DocumentType**

## **Description**

The DocumentType module is a fundamental component of the VUDEC system that manages all information related to document types. This module provides comprehensive functionality for document type management, including CRUD operations and integration with other system components. It ensures data consistency, security, and efficient data access patterns.

## **Features**

### **Document Type Management**
* Create, edit, and delete document types
* Validate document type identifiers
* Implement data integrity checks
* Maintain audit trails

## **Controllers / Resolvers**

### **Resolvers**
Located in `resolver/documentType.resolver.ts`

#### GraphQL Operations

##### Queries

###### documentType
```graphql
query DocumentType($id: ID!) {
  documentType(id: $id) {
    id
    document
  }
}
```
- **Description:** Retrieves a specific document type by ID, including basic information.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the document type to retrieve
- **Returns:** Promise<DocumentType> - Returns the found document type

##### documentTypes
```graphql
query DocumentTypes {
  documentTypes {
    id
    document
  }
}
```
- **Description:** Retrieves all document types.
- **Access:** Public
- **Returns:** Promise<DocumentType[]> - Returns a list of document types

## **Services**

### **DocumentTypeService**
Located in `services/documentType.service.ts`

#### Core Methods

##### create
```typescript
async create(input: CreateDocumentTypeInput): Promise<DocumentType>
```
- **Description:** Creates a new document type in the system.
- **Parameters:**
  - `input`: CreateDocumentTypeInput containing the document type data
- **Returns:** Promise<DocumentType> - Returns the created document type

##### update
```typescript
async update(id: string, input: UpdateDocumentTypeInput): Promise<DocumentType>
```
- **Description:** Updates an existing document type.
- **Parameters:**
  - `id`: ID of the document type to update
  - `input`: UpdateDocumentTypeInput containing the updated data
- **Returns:** Promise<DocumentType> - Returns the updated document type

##### remove
```typescript
async remove(id: string): Promise<void>
```
- **Description:** Removes a document type from the system.
- **Parameters:**
  - `id`: ID of the document type to remove
- **Returns:** Promise<void> - Indicates successful removal

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/documentType.entity.ts`

#### Database Table
- **Table Name:** grl_documentType
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| document | string | No | Document type name | String |

### **DTOs (Data Transfer Objects)**
Located in `dto/create-document-type.input.ts` and `dto/update-document-type.input.ts`

#### CreateDocumentTypeInput
##### Description
Data Transfer Object for creating a new document type in the system. Defines the data structure required to create a document type, including validations.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| document | string | Yes | Document type name | - IsString |

#### UpdateDocumentTypeInput
##### Description
Data Transfer Object for updating an existing document type in the system. Extends CreateDocumentTypeInput with additional fields for updates.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| id | string | Yes | ID of the document type | - IsString<br>- IsUUID |

## **Module**

### **DocumentTypeModule**
Located in `documentType.module.ts`

#### Description
Module that groups all components related to document type management, including entities, resolvers, services, and DTOs.

#### Providers
- DocumentTypeResolver
- DocumentTypeService

#### Imports
- TypeOrmModule for the DocumentType entity 