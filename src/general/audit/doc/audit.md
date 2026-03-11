[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Audit Module Documentation]

# **Module: Audit**

## **Description**

The Audit module is a crucial component of the VUDEC system that manages all information related to audit logs of actions performed within the system. This module provides comprehensive functionality for recording and tracking actions, ensuring data integrity and traceability. It is designed to integrate with other system components, such as the user module and security system. It implements a robust architecture that ensures data consistency, security, and efficient access patterns.

## **Features**

### **Example - Audit Management**
* Create, update, and delete audit records
* Log standard and custom actions
* Maintain a detailed history of changes
* Validate audit data integrity
* Generate audit logs for user actions

## **Resolvers**
Located in `resolvers/audit.resolver.ts`

#### GraphQL Operations

##### Queries

###### audit
```graphql
query Audit($id: ID!) {
  audit(id: $id) {
    id
    action
    type
    message
    user {
      id
      name
    }
  }
}
```
- **Description:** Retrieves a specific audit record by ID, including basic information and the associated user. This query provides a comprehensive view of the audit data and its relationships.
- **Access:** Admin only
- **Parameters:**
  - `id`: ID of the audit record to retrieve
- **Returns:** Promise<Audit> - Returns the found audit record

###### Example Usage
```graphql
# Example GraphQL query
query {
  audit(id: "audit-123") {
    id
    action
    type
    message
    user {
      id
      name
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "audit": {
      "id": "audit-123",
      "action": "create",
      "type": "update",
      "message": "User updated profile",
      "user": {
        "id": "user-456",
        "name": "Jane Doe"
      }
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/audit.service.ts`

#### Dependencies
- `EventEmitter2`: Event handling service
- `Repository<Audit>`: TypeORM repository for the audit entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### beforeMutation
```typescript
async beforeMutation(context: IContext, repository: Repository<Audit>, entity: Audit, input: CreateAuditInput | UpdateAuditInput): Promise<Audit>
```
- **Description:** Performs pre-mutation operations on an audit record. This method is the central point for audit management, handling validation and user assignment.
- **Parameters:**
  - `context`: IContext object containing request context
  - `repository`: Repository of the Audit entity
  - `entity`: Audit entity to process
  - `input`: Create or update audit input
- **Returns:** Promise<Audit> - Returns the processed audit entity

###### Example Usage
```typescript
const audit = await auditService.beforeMutation(context, repository, auditEntity, createAuditInput);
```

###### Example Response
```typescript
{
  id: 'audit-123',
  action: 'create',
  type: 'update',
  message: 'User updated profile',
  user: {
    id: 'user-456',
    name: 'Jane Doe'
  }
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/audit.entity.ts`

#### Database Table
- **Table Name:** grl_audit
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| action | StandardActions | No | Action performed | StandardActions |
| type | ActionTypeAudit | No | Type of audit action | ActionTypeAudit |
| message | string | No | Descriptive message of the action | String |

##### User Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| user | User | Yes | User who performed the action | User |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-audit.input.ts`

#### CreateAuditInput
##### Description
Data Transfer Object for creating a new audit record in the system. This DTO defines the data structure required to create an audit record, including validations and data transformations.

##### Fields
| Field | Type | Required | Description | Validation Rules | Transformations |
|-------|------|----------|-------------|------------------|-----------------|
| action | StandardActions | Yes | Action performed | - IsEnum(StandardActions) | - |
| type | ActionTypeAudit | Yes | Type of audit action | - IsEnum(ActionTypeAudit) | - |
| message | string | Yes | Descriptive message of the action | - IsString<br>- IsNotEmpty | - |

### **Enums (Enumerations)**
Located in `enums/action-audit.enum.ts`

#### ActionTypeAudit
##### Description
Defines the types of audit actions that can be recorded in the system. This enumeration covers all valid types of audit actions.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| Create | Creation of a resource | Logging entity creation |
| Update | Update of a resource | Logging modifications to entities |
| Delete | Deletion of a resource | Logging entity deletions |
| Error | Error in an operation | Logging errors in operations |

## **Module**

### **Description**
The audit module is a global module that can be called from any other module in the system. It is designed to be easily integrable and provide audit services at a global level.

### **Configuration**
Located in `audit.module.ts`

#### Imports
- `TypeOrmModule.forFeature([Audit])`: TypeORM configuration for the audit entity

#### Providers
- `AuditResolver`: Resolver for audit operations
- `AuditService`: Service for audit management

#### Exports
- `AuditService`: Exported audit service for use in other modules 