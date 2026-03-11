[Home](../../../../../../README.md) > [General Module Documentation](../../../docs/general.md) > [Document Module Documentation]

# **Module: Documents**

## **Description**

The Documents module is an essential part of the VUDEC system that manages all information related to documents. This module provides comprehensive functionality for document management, including creation, updating, and report generation in various formats. It is designed to integrate with other system components, ensuring data consistency, security, and efficient access to information.

## **Features**

### **Document Management**
* Create, edit, and delete documents
* Generate reports in Excel and PDF formats
* Handle external and internal documents
* Validate and manage external identifiers
* Implement data integrity checks
* Maintain audit trails

## **Controllers / Resolvers**

### **Resolvers**
Located in `resolvers/document.resolver.ts`

#### GraphQL Operations

##### Queries

###### document
```graphql
query Document($id: ID!) {
  document(id: $id) {
    id
    name
    externalId
    hasFinalDocument
    hasCanceled
  }
}
```
- **Description:** Retrieves a specific document by ID, including basic information and document status.
- **Access:** Admin only
- **Parameters:**
  - `id`: ID of the document to retrieve
- **Returns:** Promise<Document> - Returns the found document

## **Services**

### **DocumentService**
Located in `services/document.service.ts`

#### Core Methods

##### createExcelReport
```typescript
async createExcelReport(context: IContext, data: any[], fileName: string, sheetName: string, fields: Filter[]): Promise<ExcelJS.Workbook>
```
- **Description:** Creates an Excel report based on the provided data. Configures columns, adds data, and applies styles to cells.
- **Parameters:**
  - `context`: IContext object containing request context
  - `data`: Data to include in the report
  - `fileName`: Name of the Excel file
  - `sheetName`: Name of the worksheet
  - `fields`: Filters to configure columns
- **Returns:** Promise<ExcelJS.Workbook> - Returns the created Excel workbook

##### createExcelUrlReport
```typescript
async createExcelUrlReport(context: IContext, data: any[], fileName: string, sheetName: string, fields: Filter[]): Promise<string>
```
- **Description:** Creates an Excel report and returns a URL to access the report.
- **Parameters:**
  - `context`: IContext object containing request context
  - `data`: Data to include in the report
  - `fileName`: Name of the Excel file
  - `sheetName`: Name of the worksheet
  - `fields`: Filters to configure columns
- **Returns:** Promise<string> - Returns the URL to access the Excel report

### **DocumentManagerService**
Located in `services/document.manager.service.ts`

#### Core Methods

##### docxCompiler
```typescript
async docxCompiler(base64: string, variables: any)
```
- **Description:** Compiles a DOCX document using a base64 encoded string and additional variables. This method sends a request to an external service to generate the document.
- **Parameters:**
  - `base64`: Base64 encoded string of the document
  - `variables`: Additional variables for document compilation
- **Returns:** Response from the external service
- **Throws:** InternalServerErrorException if the request fails

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/document.entity.ts`

#### Database Table
- **Table Name:** grl_document
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| name | string | Yes | Document name | String |
| externalId | string | Yes | External identifier of the document | String |
| hasFinalDocument | boolean | No | Indicates if the document is final | Boolean |
| hasCanceled | boolean | No | Indicates if the document has been canceled | Boolean |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-document.input.ts` and `dto/inputs/update-document.input.ts`

#### CreateDocumentInput
##### Description
Data Transfer Object for creating a new document in the system. Defines the data structure required to create a document, including validations and data transformations.

##### Fields
| Field | Type | Required | Description | Validation Rules | Transformations |
|-------|------|----------|-------------|------------------|-----------------|
| name | string | No | Document name | - IsString | trim() |
| hasFinalDocument | boolean | No | Indicates if the document is final | - IsBoolean | - |
| consecutiveId | string | Yes | Consecutive identifier of the document | - IsNotEmpty<br>- IsString | trim() |
| externalId | string | No | External identifier of the document | - IsString | - |

### **Enums (Enumerations)**
Located in `enum/file-extension.enum.ts`

#### FileExtension
##### Description
Defines the types of file extensions that can be used for documents in the system.

##### Values
| Value | Description |
|-------|-------------|
| Pdf | Document in PDF format |

### **Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for event handling in the document module. These constants are used to identify different types of document-related events in the system.

#### Values
```typescript
export const createDocumentEvent = 'createDocumentEvent';
export const findDocumentsByProcessInstanceEvent = 'findDocumentsByProcessInstance';
export const createExcelReportEvent = 'createExcelReportEvent';
export const createExcelReportUrlEvent = 'createExcelReportUrlEvent';
export const createPdfReportEvent = 'createPdfReportEvent';
export const findDocumentByIdEvent = 'findDocumentByIdEvent';
export const FindDocumentByExternalId = 'findDocumentByExternalId';
export const findDocumentByProcessAndConsecutiveEvent = 'findDocumentByProcessAndConsecutiveEvent';
```

## **Module**

### **DocumentModule**
Located in `document.module.ts`

#### Description
Module that groups all components related to document management, including entities, resolvers, services, and constants.

#### Providers
- DocumentResolver
- DocumentService
- DocumentManagerService

#### Imports
- TypeOrmModule for the Document entity
- FilesModule
- HttpModule 