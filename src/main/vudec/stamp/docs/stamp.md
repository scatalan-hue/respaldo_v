[Home](../../../../../README.md) > [Main Module Documentation](../../../docs/main.md) > [Stamp Module Documentation] 

# **Module: Stamp**

## **Description**

The Stamp module is a fundamental component of the VUDEC system that manages all information related to stamps. A stamp represents a unique identifier used to track and validate movements within the system. This module provides comprehensive functionality for stamp management, including CRUD operations and movement associations. The module is designed to integrate with other system components such as the movement module, ensuring proper data relationships and business logic validation.

## **Features**

### **Example - Stamp Management**
* Create, edit, and delete stamps
* Track stamp movements and associations
* Validate stamp numbers and uniqueness
* Handle movement relationships
* Implement data integrity checks
* Maintain audit trails
* Support stamp search and filtering
* Manage stamp status and availability

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/stamp.resolver.ts`

#### GraphQL Operations

##### Queries

###### stamp
```graphql
query Stamp($id: ID!) {
  stamp(id: $id) {
    id
    stampNumber
    name
    movements {
      id
      contractId
    }
  }
}
```
- **Description:** Retrieves a specific stamp by ID, including basic information and associated movements.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the stamp to retrieve
- **Returns:** Promise<Stamp> - Returns the found stamp

###### Example Usage
```graphql
# Example GraphQL query
query {
  stamp(id: "stamp-123") {
    id
    stampNumber
    name
    movements {
      id
      contractId
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "stamp": {
      "id": "stamp-123",
      "stampNumber": "STAMP-001",
      "name": "Example Stamp",
      "movements": [
        {
          "id": "mov-123",
          "contractId": "contract-123"
        }
      ]
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/stamp.services.ts`

#### Dependencies
- `Repository<Stamp>`: TypeORM repository for stamp entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### findOrCreate
```typescript
async findOrCreate(context: IContext, createInput: CreateStampInput): Promise<Stamp>
```
- **Description:** Finds an existing stamp or creates a new one if none exists. This method ensures unique stamp numbers and handles stamp creation with proper validation.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createInput`: CreateStampInput with stamp data
- **Returns:** Promise<Stamp> - Returns the found or created stamp
- **Features:**
  - Stamp number uniqueness validation
  - Automatic creation if not exists
  - Context validation
  - Input validation

###### Example Usage
```typescript
const stamp = await stampService.findOrCreate(context, {
  stampNumber: 'STAMP-001',
  name: 'Example Stamp'
});
```

###### Example Response
```typescript
{
  id: 'stamp-123',
  stampNumber: 'STAMP-001',
  name: 'Example Stamp',
  movements: [],
  createdAt: '2024-03-20T12:00:00Z',
  updatedAt: '2024-03-20T12:00:00Z'
}
```

##### getQueryBuilder
```typescript
async getQueryBuilder(context: IContext, args?: FindStampArgs): Promise<SelectQueryBuilder<Stamp>>
```
- **Description:** Gets a configured query builder for stamp searches. This method supports filtering by contract ID and movement associations.
- **Parameters:**
  - `context`: IContext object containing request context
  - `args`: Optional FindStampArgs for search criteria
- **Returns:** Promise<SelectQueryBuilder<Stamp>> - Returns the configured query builder
- **Features:**
  - Contract-based filtering
  - Movement association filtering
  - Custom query building
  - Context validation

###### Example Usage
```typescript
const qb = await stampService.getQueryBuilder(context, {
  contractId: 'contract-123'
});
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup

#### Event Handlers

##### onFindOrCreateStampEvent
```typescript
@OnEvent(findOrCreateStampEvent)
async onFindOrCreateStampEvent({ context, createInput }: { context: IContext; createInput: CreateStampInput }): Promise<Stamp>
```
- **Description:** Event handler for finding or creating a stamp. This handler manages stamp operations through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.createInput`: CreateStampInput with stamp data
- **Returns:** Promise<Stamp> - Returns the found or created stamp
- **Features:**
  - Stamp number uniqueness validation
  - Event-based execution
  - Context validation
  - Input validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrCreateStampEvent, {
  context,
  createInput: {
    stampNumber: 'STAMP-001',
    name: 'Example Stamp'
  }
});
```

###### Example Response
```typescript
{
  id: 'stamp-123',
  stampNumber: 'STAMP-001',
  name: 'Example Stamp',
  movements: []
}
```

##### onFindStampEvent
```typescript
@OnEvent(findStampEvent)
async onFindStampEvent({ context, stampNumber }: { context: IContext; stampNumber: string }): Promise<Stamp>
```
- **Description:** Event handler for finding a stamp by stamp number. This handler manages stamp retrieval through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.stampNumber`: Stamp number to find
- **Returns:** Promise<Stamp> - Returns the found stamp
- **Features:**
  - Error handling for not found cases
  - Event-based execution
  - Context validation
  - Stamp existence validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findStampEvent, {
  context,
  stampNumber: 'STAMP-001'
});
```

###### Example Response
```typescript
{
  id: 'stamp-123',
  stampNumber: 'STAMP-001',
  name: 'Example Stamp',
  movements: [
    {
      id: 'mov-123',
      contractId: 'contract-123'
    }
  ]
}
```

##### onCreateStampEvent
```typescript
@OnEvent(createStampEvent)
async onCreateStampEvent({ context, createStampInput }: { context: IContext; createStampInput: CreateStampInput }): Promise<Stamp>
```
- **Description:** Event handler for creating a new stamp. This handler manages stamp creation through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.createStampInput`: CreateStampInput with stamp data
- **Returns:** Promise<Stamp> - Returns the created stamp
- **Features:**
  - Stamp number uniqueness validation
  - Event-based execution
  - Context validation
  - Input validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(createStampEvent, {
  context,
  createStampInput: {
    stampNumber: 'STAMP-001',
    name: 'Example Stamp'
  }
});
```

###### Example Response
```typescript
{
  id: 'stamp-123',
  stampNumber: 'STAMP-001',
  name: 'Example Stamp',
  movements: []
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entity/stamp.entity.ts`

#### Database Table
- **Table Name:** vudec_stamp
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| stampNumber | string | No | Unique stamp number | String |
| name | string | Yes | Stamp name | String |

#### Relationships

##### Movements
```typescript
@OneToMany(() => Movement, (movement) => movement.stamp, {
  lazy: true,
})
@Field(() => [Movement], { nullable: true })
movements: Movement[];
```
- **Type:** One-to-Many
- **Related Entity:** Movement
- **Description:** Links stamp to its movements
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

### **Constants**
Located in `constants/stamp.constants.ts`

#### Description
Defines event constants used for event handling in the stamp module. These constants are used to identify different types of stamp-related events in the system.

#### Values
```typescript
export const findStampEvent = 'findStampEvent';
export const findOrCreateStampEvent = 'findOrCreateStampEvent';
export const createStampEvent = 'createStampEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger stamp search operations
- Handle stamp creation and updates
- Manage event-based communication between different parts of the system 