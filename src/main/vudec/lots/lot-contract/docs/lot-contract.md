[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Lot Contract Module Documentation] 

# **Module: Lot Contract**

## **Description**

The Lot Contract module is a fundamental component of the VUDEC system that manages the relationship between lots and contracts. This module provides functionality for associating contracts with lots, enabling the tracking and management of contractual operations within specific lots. The module is designed to integrate with both the lot and contract systems, ensuring proper data relationships and business logic validation.

## **Features**

### **Example - Lot Contract Management**
* Create and manage lot-contract associations
* Track contract assignments to lots
* Validate lot and contract relationships
* Handle lot-contract creation and updates
* Maintain lot-contract history
* Support lot-contract queries and searches
* Manage lot-contract descriptions
* Ensure data integrity between lots and contracts

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/lot-contract.resolver.ts`

#### GraphQL Operations

##### Queries

###### lotContract
```graphql
query LotContract($id: ID!) {
  lotContract(id: $id) {
    id
    description
    lot {
      id
      consecutive
      name
    }
    contract {
      id
      contractType
      contractConsecutive
    }
  }
}
```
- **Description:** Retrieves a specific lot-contract association by ID, including the related lot and contract information.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the lot-contract to retrieve
- **Returns:** Promise<LotContract> - Returns the found lot-contract association

###### Example Usage
```graphql
# Example GraphQL query
query {
  lotContract(id: "lot-contract-123") {
    id
    description
    lot {
      id
      consecutive
      name
    }
    contract {
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
    "lotContract": {
      "id": "lot-contract-123",
      "description": "Contract assignment for daily operations",
      "lot": {
        "id": "lot-123",
        "consecutive": "LOT-001",
        "name": "Daily Lot 2024-03-20"
      },
      "contract": {
        "id": "contract-123",
        "contractType": "SERVICE"
      }
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/lot-contract.service.ts`

#### Dependencies
- `EventEmitter2`: Event handling service
- `Repository<LotContract>`: TypeORM repository for lot-contract entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### findOrCreateLotContract
```typescript
private async findOrCreateLotContract({ context, input }: { context: IContext; input: CreateLotContractInput }): Promise<LotContract>
```
- **Description:** Finds an existing lot-contract association or creates a new one if none exists. This method ensures unique lot-contract relationships.
- **Parameters:**
  - `context`: IContext object containing request context
  - `input`: CreateLotContractInput with lot and contract IDs
- **Returns:** Promise<LotContract> - Returns the found or created lot-contract association
- **Features:**
  - Duplicate prevention
  - Relationship validation
  - Automatic creation if not exists

###### Example Usage
```typescript
const lotContract = await lotContractService.findOrCreateLotContract({
  context,
  input: {
    lotId: 'lot-123',
    contractId: 'contract-123',
    description: 'Contract assignment for daily operations'
  }
});
```

###### Example Response
```typescript
{
  id: 'lot-contract-123',
  description: 'Contract assignment for daily operations',
  lot: {
    id: 'lot-123',
    consecutive: 'LOT-001',
    name: 'Daily Lot 2024-03-20'
  },
  contract: {
    id: 'contract-123',
    contractType: 'SERVICE'
  },
  createdAt: '2024-03-20T12:00:00Z',
  updatedAt: '2024-03-20T12:00:00Z'
}
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup
- `beforeUpdate`: Pre-update validation and setup
- `beforeMutation`: Pre-mutation validation and setup

#### Event Handlers

##### onCreateLotContract
```typescript
@OnEvent(createLotContractEvent)
async onCreateLotContract(payload: { context: IContext; input: CreateLotContractInput }): Promise<LotContract>
```
- **Description:** Event handler for creating a new lot-contract association. This handler manages the creation of new lot-contract relationships, ensuring proper validation and data integrity.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.input`: CreateLotContractInput containing lot and contract IDs
- **Returns:** Promise<LotContract> - Returns the created lot-contract association
- **Features:**
  - Input validation
  - Relationship validation
  - Error handling
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(createLotContractEvent, {
  context,
  input: {
    lotId: 'lot-123',
    contractId: 'contract-123',
    description: 'Contract assignment for daily operations'
  }
});
```

###### Example Response
```typescript
{
  id: 'lot-contract-123',
  description: 'Contract assignment for daily operations',
  lot: {
    id: 'lot-123',
    consecutive: 'LOT-001',
    name: 'Daily Lot 2024-03-20'
  },
  contract: {
    id: 'contract-123',
    contractType: 'SERVICE'
  }
}
```

##### onFindOrCreateLotContract
```typescript
@OnEvent(findOrCreateLotContractEvent)
async onFindOrCreateLotContract(payload: { context: IContext; input: CreateLotContractInput }): Promise<LotContract>
```
- **Description:** Event handler for finding or creating a lot-contract association. This handler ensures unique lot-contract relationships by either finding an existing association or creating a new one.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.input`: CreateLotContractInput containing lot and contract IDs
- **Returns:** Promise<LotContract> - Returns the found or created lot-contract association
- **Features:**
  - Duplicate prevention
  - Relationship validation
  - Automatic creation if not exists
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrCreateLotContractEvent, {
  context,
  input: {
    lotId: 'lot-123',
    contractId: 'contract-123',
    description: 'Contract assignment for daily operations'
  }
});
```

###### Example Response
```typescript
{
  id: 'lot-contract-123',
  description: 'Contract assignment for daily operations',
  lot: {
    id: 'lot-123',
    consecutive: 'LOT-001',
    name: 'Daily Lot 2024-03-20'
  },
  contract: {
    id: 'contract-123',
    contractType: 'SERVICE'
  }
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/lot-contract.entity.ts`

#### Database Table
- **Table Name:** vudec_lot_contract
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| description | string | Yes | Description of the lot-contract association | String |

#### Relationships

##### Lot
```typescript
@ManyToOne(() => Lot, (lot) => lot.lotContracts, {
  lazy: true,
  nullable: false,
})
@Field(() => Lot, { nullable: true })
lot?: Lot;
```
- **Type:** Many-to-One
- **Related Entity:** Lot
- **Description:** Links lot-contract to lot
- **Loading:** Lazy loading enabled
- **Nullable:** No

##### Contract
```typescript
@ManyToOne(() => Contract, (contract) => contract.lotContracts, {
  lazy: true,
  nullable: false,
})
@Field(() => Contract, { nullable: true })
contract?: Contract;
```
- **Type:** Many-to-One
- **Related Entity:** Contract
- **Description:** Links lot-contract to contract
- **Loading:** Lazy loading enabled
- **Nullable:** No

### **Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for event handling in the lot-contract module. These constants are used to identify different types of lot-contract-related events in the system.

#### Values
```typescript
export const createLotContractEvent = 'createLotContractEvent';
export const findOrCreateLotContractEvent = 'findOrCreateLotContractEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger lot-contract creation operations
- Handle lot-contract find/create operations
- Manage event-based communication between different parts of the system