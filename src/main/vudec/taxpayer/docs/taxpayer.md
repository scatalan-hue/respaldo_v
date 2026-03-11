[Home](../../../../../README.md) > [Main Module Documentation](../../../docs/main.md) > [Taxpayer Module Documentation] 

# Taxpayer Module Documentation

## **Description**

The Taxpayer module is a fundamental component of the VUDEC system that manages all information related to taxpayers. This module provides comprehensive functionality for taxpayer management, including CRUD operations, report generation, contract management, and consolidated data visualization. The module is designed to integrate with other system components such as the user module and contract system. It implements a robust architecture that ensures data consistency, security, and efficient data access patterns.

## **Features**

### **Example - Taxpayer Management**
* Create, edit, and delete taxpayers
* Generate detailed Excel reports
* Manage taxpayer contracts and relationships
* Track financial information and contract statistics
* Validate taxpayer identification documents
* Handle organization assignments
* Implement data integrity checks
* Maintain audit trails

## **Controllers / Resolvers / Producers**

### **Controllers**
Located in `controllers/taxpayer.controller.ts`

#### Dependencies
- `TaxpayerViewService`: Service for handling taxpayer view operations
- `SecurityAuthGuard`: Authentication guard
- `CurrentContext`: Context decorator
- `AnyUser`: User type validation decorator

#### Endpoints

##### POST /taxpayer/reportTaxpayers
Generates and downloads an Excel report containing detailed taxpayer information based on specific filters. This endpoint allows users to obtain consolidated taxpayer data, including financial information and contract statistics. The report is generated asynchronously and includes comprehensive data aggregation.

###### Request Details
- **Method:** POST
- **Path:** /taxpayer/reportTaxpayers
- **Content-Type:** application/json
- **Authentication:** Required (Bearer Token)

###### Request Body
```typescript
{
  where?: {
    id?: StringFilter;
    organizationId?: StringFilter;
    taxpayerNumber?: StringFilter;
    name?: StringFilter;
    phone?: StringFilter;
    email?: StringFilter;
    contractCount?: StringFilter;
    liquidatedTotal?: StringFilter;
    paidTotal?: StringFilter;
    totalPayable?: StringFilter;
  };
  orderBy?: {
    id: OrderByTypes;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}
```

###### Parameters
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| context | IContext | Decorator | Yes | Request context containing user and organization information |
| findTaxpayerViewArgs | FindTaxpayerViewArgs | Body | Yes | Filter and pagination parameters for the report |
| res | Response | Parameter | Yes | Express response object for file download |

###### Response
- **Content-Type:** application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- **Body:** Excel file containing filtered taxpayer data
- **Headers:**
  - Content-Disposition: attachment; filename="taxpayers-report.xlsx"

###### Example Usage
```typescript
// Example endpoint call
const response = await axios.post('/taxpayer/reportTaxpayers', {
  where: {
    organizationId: { eq: 'org-123' },
    contractCount: { gt: 5 }
  },
  pagination: {
    page: 1,
    limit: 100
  }
}, {
  headers: {
    'Authorization': 'Bearer token-123'
  }
});
```

###### Example Response
```typescript
// Response headers
{
  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'Content-Disposition': 'attachment; filename="taxpayers-report.xlsx"',
  'Content-Length': '12345'
}

// Response body: Binary Excel file content
```

### **Resolvers**
Located in `resolvers/taxpayer.resolver.ts`

#### GraphQL Operations

##### Queries

###### taxpayer
```graphql
query Taxpayer($id: ID!) {
  taxpayer(id: $id) {
    id
    name
    lastName
    taxpayerNumber
    email
    phone
    contracts {
      id
      contractType
    }
  }
}
```
- **Description:** Retrieves a specific taxpayer by ID, including basic information and associated contracts. This query provides a comprehensive view of the taxpayer's data and their contractual relationships.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the taxpayer to retrieve
- **Returns:** Promise<Taxpayer> - Returns the found taxpayer

###### Example Usage
```graphql
# Example GraphQL query
query {
  taxpayer(id: "tax-123") {
    id
    name
    lastName
    taxpayerNumber
    email
    phone
    contracts {
      id
      contractType
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "taxpayer": {
      "id": "tax-123",
      "name": "John",
      "lastName": "Doe",
      "taxpayerNumber": 123456789,
      "email": "john@example.com",
      "phone": "+1234567890",
      "contracts": [
        {
          "id": "contract-1",
          "contractType": "SERVICE"
        },
        {
          "id": "contract-2",
          "contractType": "PRODUCT"
        }
      ]
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/taxpayer.services.ts`

#### Dependencies
- `EventEmitter2`: Event handling service
- `Repository<Taxpayer>`: TypeORM repository for taxpayer entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### createOrUpdate
```typescript
async createOrUpdate(context: IContext, payload: CreateTaxpayerInput): Promise<Taxpayer>
```
- **Description:** Creates or updates a taxpayer in the system. This method is the central point for taxpayer management, handling validation, user system homologation, and organization assignment. It implements a mutex pattern to handle concurrent operations safely.
- **Parameters:**
  - `context`: IContext object containing request context
  - `payload`: CreateTaxpayerInput with taxpayer data
- **Returns:** Promise<Taxpayer> - Returns the created/updated taxpayer
- **Features:**
  - Organization product validation
  - User system homologation
  - Organization assignment
  - Mutex handling for concurrent operations
  - Data integrity checks
  - Audit trail generation

###### Example Usage
```typescript
const taxpayer = await taxpayerService.createOrUpdate(context, {
  name: 'John',
  lastName: 'Doe',
  taxpayerNumber: 123456789,
  email: 'john@example.com'
});
```

###### Example Response
```typescript
{
  id: 'tax-123',
  name: 'John',
  lastName: 'Doe',
  taxpayerNumber: 123456789,
  email: 'john@example.com',
  phone: null,
  createdAt: '2024-02-18T12:00:00Z',
  updatedAt: '2024-02-18T12:00:00Z',
  organizationTaxpayers: [],
  contracts: []
}
```

##### assignTaxpayerToOrganization
```typescript
async assignTaxpayerToOrganization(context: IContext, entity: Taxpayer): Promise<OrganizationTaxpayer>
```
- **Description:** Links a taxpayer to a specific organization, establishing the necessary relationship for contract management and operations. This method handles the creation of the relationship and ensures proper data consistency.
- **Parameters:**
  - `context`: IContext object
  - `entity`: Taxpayer entity to assign
- **Returns:** Promise<OrganizationTaxpayer> - Returns the created relationship between taxpayer and organization

###### Example Usage
```typescript
const orgTaxpayer = await taxpayerService.assignTaxpayerToOrganization(context, taxpayer);
```

###### Example Response
```typescript
{
  id: 'org-tax-123',
  organizationId: 'org-123',
  taxpayerId: 'tax-123',
  createdAt: '2024-02-18T12:00:00Z',
  updatedAt: '2024-02-18T12:00:00Z',
  organization: {
    id: 'org-123',
    name: 'Example Organization'
  },
  taxpayer: {
    id: 'tax-123',
    name: 'John Doe'
  }
}
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup
- `afterCreate`: Post-creation operations
- `beforeUpdate`: Pre-update validation and setup
- `afterUpdate`: Post-update operations

#### Event Handlers
- `onCreateOrUpdateTaxpayerEvent`: Handles taxpayer creation/update events
- `onFindTaxpayerEvent`: Handles taxpayer search by number
- `onFindTaxpayerByIdEvent`: Handles taxpayer search by ID
- `onFindTaxpayerByEvent`: Handles generic taxpayer search

##### onFindTaxpayerByIdEvent
```typescript
@OnEvent(findTaxpayerByIdEvent)
async onFindTaxpayerByIdEvent(payload: { context: IContext; id: string }): Promise<Taxpayer>
```
- **Description:** Event handler for finding a taxpayer by ID. This handler is triggered when a taxpayer needs to be retrieved by its unique identifier.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the taxpayer to find
- **Returns:** Promise<Taxpayer> - Returns the found taxpayer
- **Features:**
  - Error handling for not found cases
  - Context validation
  - Organization validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findTaxpayerByIdEvent, {
  context,
  id: 'taxpayer-123'
});
```

###### Example Response
```typescript
{
  id: 'taxpayer-123',
  documentType: 'NIT',
  documentNumber: '123456789',
  name: 'Example Company',
  organization: {
    id: 'org-123',
    name: 'Example Organization'
  }
}
```

##### onFindTaxpayerByDocumentEvent
```typescript
@OnEvent(findTaxpayerByDocumentEvent)
async onFindTaxpayerByDocumentEvent(payload: { context: IContext; documentType: string; documentNumber: string }): Promise<Taxpayer>
```
- **Description:** Event handler for finding a taxpayer by document type and number. This handler manages the search of taxpayers using their document information.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.documentType`: Type of document (e.g., NIT, CC)
  - `payload.documentNumber`: Document number
- **Returns:** Promise<Taxpayer> - Returns the found taxpayer
- **Features:**
  - Document validation
  - Organization validation
  - Error handling for not found cases
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findTaxpayerByDocumentEvent, {
  context,
  documentType: 'NIT',
  documentNumber: '123456789'
});
```

###### Example Response
```typescript
{
  id: 'taxpayer-123',
  documentType: 'NIT',
  documentNumber: '123456789',
  name: 'Example Company',
  organization: {
    id: 'org-123',
    name: 'Example Organization'
  }
}
```

##### onFindTaxpayerAndValidateOrganization
```typescript
@OnEvent(findTaxpayerEvent)
async onFindTaxpayerAndValidateOrganization(payload: { context: IContext; id: string }): Promise<Taxpayer>
```
- **Description:** Event handler for finding a taxpayer and validating its organization association. This handler ensures that the taxpayer belongs to the correct organization before returning it.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the taxpayer to find and validate
- **Returns:** Promise<Taxpayer> - Returns the validated taxpayer
- **Features:**
  - Organization validation
  - Error handling for invalid organizations
  - Context validation
  - Taxpayer existence validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findTaxpayerEvent, {
  context,
  id: 'taxpayer-123'
});
```

###### Example Response
```typescript
{
  id: 'taxpayer-123',
  documentType: 'NIT',
  documentNumber: '123456789',
  name: 'Example Company',
  organization: {
    id: 'org-123',
    name: 'Example Organization'
  }
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entity/taxpayer.entity.ts`

#### Database Table
- **Table Name:** vudec_taxpayer
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| name | string | Yes | Taxpayer's first name | String |
| middleName | string | Yes | Taxpayer's middle name | String |
| lastName | string | Yes | Taxpayer's last name | String |
| secondSurname | string | Yes | Taxpayer's second surname | String |

##### Identification
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| taxpayerNumber | number | No | Unique taxpayer identification number | Number |
| taxpayerNumberType | TypeDoc | Yes | Type of identification document | TypeDoc |

##### Contact Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| email | string | Yes | Taxpayer's email address | String |
| phone | string | Yes | Taxpayer's phone number | String |

#### Relationships

##### OrganizationTaxpayers
```typescript
@OneToMany(() => OrganizationTaxpayer, (organizationTaxpayer) => organizationTaxpayer.taxpayer, {
  lazy: true,
  nullable: true,
})
organizationTaxpayers?: OrganizationTaxpayer[];
```
- **Type:** One-to-Many
- **Related Entity:** OrganizationTaxpayer
- **Description:** Links taxpayer to organizations
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

##### Contracts
```typescript
@OneToMany(() => Contract, (contract) => contract.taxpayer, {
  lazy: true,
  nullable: true,
})
contracts: Contract[];
```
- **Type:** One-to-Many
- **Related Entity:** Contract
- **Description:** Links taxpayer to contracts
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-taxpayer.input.ts`

#### CreateTaxpayerInput
##### Description
Data Transfer Object for creating a new taxpayer in the system. This DTO defines the data structure required to create a taxpayer, including validations and data transformations.

##### Fields
| Field | Type | Required | Description | Validation Rules | Transformations |
|-------|------|----------|-------------|------------------|-----------------|
| fullName | string | No | Complete name of the taxpayer | - IsString | trim() |
| name | string | Yes | Taxpayer's first name | - IsString<br>- IsNotEmpty<br>- MinLength(1) | trim() |
| middleName | string | No | Taxpayer's middle name | - IsString | - |
| lastName | string | Yes | Taxpayer's last name | - IsString<br>- IsNotEmpty<br>- MinLength(1) | trim() |
| secondSurname | string | No | Taxpayer's second surname | - IsString | - |
| taxpayerNumber | number | Yes | Taxpayer identification number | - IsNotEmpty<br>- IsNumber | - |
| taxpayerNumberType | TypeDoc | No | Type of identification document | - IsEnum(TypeDoc) | trim() |
| email | string | No | Email address | - IsString<br>- maxLength(200) | trim()<br>toLowerCase() |
| phone | string | No | Phone number | - IsString<br>- maxLength(18) | trim() |

### **Enums (Enumerations)**
Located in `enums/taxpayer-type.enum.ts`

#### TypeDoc
##### Description
Defines the types of identification documents that can be used for taxpayers in the system. This enumeration is specifically designed for the Colombian context and covers all valid types of identification documents.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| CC | Citizen ID Card | Standard identification for Colombian citizens |
| RC | Civil Registry | Used for minors and newborns |
| TI | Identity Card | Used for minors between 7 and 17 years old |
| TE | Foreigner ID Card | Used for foreign residents in Colombia |
| CE | Foreign ID Card | Used for foreign citizens with special status |
| NIT | Tax ID Number | Used for companies and legal entities |
| PAS | Passport | Used for international identification |
| DIE | Foreign ID Document | Used for foreigners with diplomatic status |
| PEP | Special Stay Permit | Used for Venezuelan migrants with special status |
| NITE | Special Tax ID | Used for special tax identification cases |
| NUIP | Unique Personal ID | Used for unique personal identification |

### **Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for event handling in the taxpayer module. These constants are used to identify different types of taxpayer-related events in the system.

#### Values
```typescript
export const findTaxpayerEvent = 'findTaxpayerEvent';
export const findTaxpayerByIdEvent = 'findTaxpayerByIdEvent';
export const findTaxpayerByEvent = 'findTaxpayerByEvent';
export const createOrUpdateTaxpayerEvent = 'createOrUpdateTaxpayerEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger taxpayer search operations
- Handle taxpayer creation and updates
- Manage event-based communication between different parts of the system

### **Database Views**

#### TaxpayerView
Located in `entity/views/taxpayer.view.entity.ts`

##### Description
Database view that provides a consolidated view of taxpayer information, including contract counts and financial totals. This view optimizes frequent queries that require summarized taxpayer information.

##### Fields
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| id | string | No | Unique identifier | ID! |
| taxpayerNumber | number | No | Taxpayer identification number | Number! |
| organizationId | string | No | Organization identifier | ID! |
| name | string | No | Taxpayer name | String! |
| phone | string | Yes | Contact phone number | String |
| email | string | Yes | Contact email | String |
| contractCount | number | No | Total number of contracts | Number! |
| liquidatedTotal | number | Yes | Total liquidated amount | Number |
| paidTotal | number | Yes | Total paid amount | Number |
| totalPayable | number | Yes | Total amount payable | Number |

#### TaxpayerContractsView
Located in `entity/views/taxpayer-contracts.view.entity.ts`

##### Description
Database view that provides detailed information about taxpayer contracts, including dates and values. This view facilitates access to consolidated contractual information without requiring multiple joins.

##### Fields
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| id | string | Yes | Contract identifier | ID |
| organizationId | string | No | Organization identifier | ID! |
| productId | string | No | Product identifier | ID! |
| contractType | string | Yes | Type of contract | String |
| contractConsecutive | string | Yes | Contract sequence number | String |
| taxpayerId | string | Yes | Taxpayer identifier | ID |
| taxpayerNumber | number | Yes | Taxpayer identification number | Number |
| taxpayerName | string | Yes | Taxpayer name | String |
| contractDateIni | Date | Yes | Contract start date | Date |
| contractDateEnd | Date | Yes | Contract end date | Date |
| contractValue | number | Yes | Contract monetary value | Number | 