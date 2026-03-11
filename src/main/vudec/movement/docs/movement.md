[Home](../../../../README.md) > [Main Module Documentation](../../../docs/main.md) > [Movement Module Documentation] 

# **Module: Movement**

## **Description**

The Movement module is a fundamental component of the VUDEC system that manages all information related to movements. A movement represents a financial transaction or operation within the system, such as registrations, adhesions, and applications. This module provides comprehensive functionality for movement management, including CRUD operations, status tracking, and integration with external systems like SIGEC. The module is designed to integrate with other system components such as contracts, stamps, and lots, ensuring proper data relationships and business logic validation.

## **Features**

### **Example - Movement Management**
* Create, edit, and delete movements
* Track movement status and lifecycle
* Handle different movement types (Register, Adhesion, Apply)
* Manage movement relationships with contracts and stamps
* Implement data integrity checks
* Maintain audit trails
* Support movement search and filtering
* Integrate with external systems (SIGEC)
* Handle movement notifications
* Support movement reversals

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/movement.resolver.ts`

#### GraphQL Operations

##### Queries

###### movement
```graphql
query Movement($id: ID!) {
  movement(id: $id) {
    id
    description
    expenditureNumber
    movId
    associatedMovement
    liquidatedValue
    paidValue
    type
    date
    value
    status
    message
    contract {
      id
      contractType
    }
    stamp {
      id
      stampNumber
    }
    lot {
      id
      consecutive
    }
    isRevert
  }
}
```
- **Description:** Retrieves a specific movement by ID, including basic information and associated entities.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the movement to retrieve
- **Returns:** Promise<Movement> - Returns the found movement

###### Example Usage
```graphql
# Example GraphQL query
query {
  movement(id: "mov-123") {
    id
    description
    expenditureNumber
    movId
    type
    status
    contract {
      id
      contractType
    }
    stamp {
      id
      stampNumber
    }
    lot {
      id
      consecutive
    }
  }
}
```

###### Example Response
```json
{
  "data": {
    "movement": {
      "id": "mov-123",
      "description": "Example movement",
      "expenditureNumber": "EXP-001",
      "movId": "MOV-001",
      "type": "REGISTER",
      "status": "SEND",
      "contract": {
        "id": "contract-123",
        "contractType": "SERVICE"
      },
      "stamp": {
        "id": "stamp-123",
        "stampNumber": "STAMP-001"
      },
      "lot": {
        "id": "lot-123",
        "consecutive": "LOT-001"
      }
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/movement.service.ts`

#### Dependencies
- `EventEmitter2`: Event handling service
- `MovementLatestViewService`: Service for handling movement latest view
- `Repository<Movement>`: TypeORM repository for movement entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### createMovements
```typescript
async createMovements(context: IContext, movementsInput: RequestCreateMovement[]): Promise<Movement[]>
```
- **Description:** Creates multiple movements in batch. This method handles the creation of related movements with proper validation and business logic.
- **Parameters:**
  - `context`: IContext object containing request context
  - `movementsInput`: Array of RequestCreateMovement with movement data
- **Returns:** Promise<Movement[]> - Returns array of created movements
- **Features:**
  - Batch processing
  - Movement validation
  - Business logic validation
  - Context validation

###### Example Usage
```typescript
const movements = await movementService.createMovements(context, [
  {
    type: 'REGISTER',
    value: 1000,
    contractId: 'contract-123',
    stampNumber: 'STAMP-001'
  }
]);
```

###### Example Response
```typescript
[
  {
    id: 'mov-123',
    description: 'Example movement',
    expenditureNumber: 'EXP-001',
    movId: 'MOV-001',
    type: 'REGISTER',
    status: 'UNSENT',
    value: 1000,
    contract: {
      id: 'contract-123',
      contractType: 'SERVICE'
    },
    stamp: {
      id: 'stamp-123',
      stampNumber: 'STAMP-001'
    }
  }
]
```

##### sendMovementsToSigec
```typescript
async sendMovementsToSigec(context: IContext, contractId: string, lotId?: string): Promise<string>
```
- **Description:** Sends movements to the SIGEC external system. This method handles the integration and synchronization of movements with SIGEC.
- **Parameters:**
  - `context`: IContext object containing request context
  - `contractId`: ID of the contract
  - `lotId`: Optional ID of the lot
- **Returns:** Promise<string> - Returns the result of the operation
- **Features:**
  - External system integration
  - Movement synchronization
  - Status updates
  - Error handling

###### Example Usage
```typescript
const result = await movementService.sendMovementsToSigec(context, 'contract-123', 'lot-123');
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup

#### Event Handlers

##### onCreateMovementsEvent
```typescript
@OnEvent(createMovementsEvent)
async onCreateMovementsEvent({ context, movementsInput }: { context: IContext; movementsInput: RequestCreateMovement[] }): Promise<Movement[]>
```
- **Description:** Event handler for creating multiple movements. This handler manages movement creation through the event system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.movementsInput`: Array of RequestCreateMovement with movement data
- **Returns:** Promise<Movement[]> - Returns array of created movements
- **Features:**
  - Batch processing
  - Event-based execution
  - Movement validation
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(createMovementsEvent, {
  context,
  movementsInput: [
    {
      type: 'REGISTER',
      value: 1000,
      contractId: 'contract-123',
      stampNumber: 'STAMP-001'
    }
  ]
});
```

###### Example Response
```typescript
[
  {
    id: 'mov-123',
    description: 'Example movement',
    expenditureNumber: 'EXP-001',
    movId: 'MOV-001',
    type: 'REGISTER',
    status: 'UNSENT',
    value: 1000,
    contract: {
      id: 'contract-123',
      contractType: 'SERVICE'
    },
    stamp: {
      id: 'stamp-123',
      stampNumber: 'STAMP-001'
    }
  }
]
```

##### onHandleUnsentMovementsEvent
```typescript
@OnEvent(handleUnsentMovementsEvent)
async onHandleUnsentMovementsEvent({ context, expenditureNumber, contractId }: { context: IContext; expenditureNumber: string; contractId: string }): Promise<void>
```
- **Description:** Event handler for handling unsent movements. This handler manages the processing of movements that haven't been sent to SIGEC.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.expenditureNumber`: Expenditure number to process
  - `payload.contractId`: ID of the contract
- **Returns:** Promise<void>
- **Features:**
  - Movement status tracking
  - Error handling
  - Event-based execution
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(handleUnsentMovementsEvent, {
  context,
  expenditureNumber: 'EXP-001',
  contractId: 'contract-123'
});
```

##### onIsValidMovementsEvent
```typescript
@OnEvent(isValidMovementsEvent)
async onIsValidMovementsEvent({ context, input, movementsInput }: { context: IContext; input: RequestCreateMovement; movementsInput: RequestCreateMovement[] }): Promise<boolean>
```
- **Description:** Event handler for validating movements. This handler checks if movements are valid according to business rules.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.input`: RequestCreateMovement to validate
  - `payload.movementsInput`: Array of related movements
- **Returns:** Promise<boolean> - Returns whether the movements are valid
- **Features:**
  - Business rule validation
  - Movement relationship validation
  - Event-based execution
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(isValidMovementsEvent, {
  context,
  input: {
    type: 'REGISTER',
    value: 1000,
    contractId: 'contract-123'
  },
  movementsInput: []
});
```

##### onSendMovementsToSigecEvent
```typescript
@OnEvent(sendMovementsToSigecEvent)
async onSendMovementsToSigecEvent({ context, contractId }: { context: IContext; contractId: string }): Promise<void>
```
- **Description:** Event handler for sending movements to SIGEC. This handler manages the integration with the external SIGEC system.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.contractId`: ID of the contract
- **Returns:** Promise<void>
- **Features:**
  - External system integration
  - Movement synchronization
  - Status updates
  - Event-based execution

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(sendMovementsToSigecEvent, {
  context,
  contractId: 'contract-123'
});
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entity/movement.entity.ts`

#### Database Table
- **Table Name:** vudec_movement
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| description | string | Yes | Movement description | String |
| expenditureNumber | string | Yes | Expenditure number | String |
| movId | string | Yes | Movement ID | String |
| associatedMovement | string | Yes | Associated movement reference | String |
| liquidatedValue | number | Yes | Liquidated value | Number |
| paidValue | number | Yes | Paid value | Number |
| type | TypeMovement | Yes | Movement type | TypeMovement |
| date | Date | Yes | Movement date | Date |
| value | number | Yes | Movement value | Number |
| status | MovementStatus | No | Movement status | MovementStatus |
| message | string | Yes | Status message | String |
| isRevert | boolean | Yes | Whether it's a revert movement | Boolean |

#### Relationships

##### Contract
```typescript
@ManyToOne(() => Contract, (contract) => contract.movements, {
  lazy: true,
  nullable: true,
})
@Field(() => Contract, { nullable: true })
contract?: Contract;
```
- **Type:** Many-to-One
- **Related Entity:** Contract
- **Description:** Links movement to contract
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

##### Stamp
```typescript
@ManyToOne(() => Stamp, (stamp) => stamp.movements, {
  lazy: true,
  nullable: true,
})
@Field(() => Stamp, { nullable: true })
stamp?: Stamp;
```
- **Type:** Many-to-One
- **Related Entity:** Stamp
- **Description:** Links movement to stamp
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

##### Lot
```typescript
@ManyToOne(() => Lot, (lot) => lot.movements, {
  lazy: true,
  nullable: true,
})
@Field(() => Lot, { nullable: true })
lot?: Lot;
```
- **Type:** Many-to-One
- **Related Entity:** Lot
- **Description:** Links movement to lot
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

### **Enums (Enumerations)**
Located in `enums/movement-status.enum.ts` and `enums/movement-type.enum.ts`

#### MovementStatus
##### Description
Defines the possible states of a movement in the system. This enumeration manages the lifecycle of movements.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| Error | Movement has errors | Failed operations |
| Send | Movement has been sent | Successfully processed |
| Unsent | Movement hasn't been sent | Pending operations |
| Empty | No status | Initial state |

#### TypeMovement
##### Description
Defines the types of movements available in the system. This enumeration categorizes different kinds of financial operations.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| Register | Initial registration | New movement registration |
| Adhesion | Contract adhesion | Contract-related operations |
| Apply | Value application | Payment applications |

### **Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for event handling in the movement module. These constants are used to identify different types of movement-related events in the system.

#### Values
```typescript
export const createMovementsEvent = 'createMovementsEvent';
export const handleUnsentMovementsEvent = 'handleUnsentMovementsEvent';
export const isValidMovementsEvent = 'isValidMovementsEvent';
export const sendMovementsToSigecEvent = 'sendMovementsToSigecEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger movement creation operations
- Handle unsent movements
- Validate movements
- Manage SIGEC integration 