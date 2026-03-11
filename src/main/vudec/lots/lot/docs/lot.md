[Home](../../../../../../README.md) > [Main Module Documentation](../../../../docs/main.md) > [Lots Module Documentation] 

# **Module: Lot**

## **Description**

The Lot module is a fundamental component of the VUDEC system that manages the creation and tracking of lots. A lot represents a batch or group of related operations, which can be either daily or custom. This module provides functionality for lot management, including creation, tracking, and association with contracts and movements. The module is designed to integrate with other system components such as the organization product module and contract system.

## **Features**

### **Example - Lot Management**
* Create and manage daily and custom lots
* Track lot movements and contracts
* Generate lot consecutives automatically
* Validate lot organization assignments
* Handle concurrent lot operations
* Maintain lot history and audit trails
* Support lot type categorization
* Manage lot relationships with contracts and movements

## **Controllers / Resolvers / Producers**

### **Resolvers**
Located in `resolvers/lot.resolver.ts`

#### GraphQL Operations

##### Queries

###### lot
```graphql
query Lot($id: ID!) {
  lot(id: $id) {
    id
    consecutive
    name
    lotType
    organizationProduct {
      id
      name
    }
    lotContracts {
      id
      contractType
    }
    movements {
      id
      movementType
    }
  }
}
```
- **Description:** Retrieves a specific lot by ID, including basic information, associated contracts, and movements.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the lot to retrieve
- **Returns:** Promise<Lot> - Returns the found lot

###### Example Usage
```graphql
# Example GraphQL query
query {
  lot(id: "lot-123") {
    id
    consecutive
    name
    lotType
    organizationProduct {
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
    "lot": {
      "id": "lot-123",
      "consecutive": "LOT-001",
      "name": "Daily Lot 2024-03-20",
      "lotType": "DAILY",
      "organizationProduct": {
        "id": "org-prod-123",
        "name": "Example Product"
      }
    }
  }
}
```

## **Services**

### **Functions**
Located in `services/lot.services.ts`

#### Dependencies
- `EventEmitter2`: Event handling service
- `Repository<Lot>`: TypeORM repository for lot entity
- `CrudServiceFrom`: Base CRUD service functionality

#### Core Methods

##### findOrCreateDailyLot
```typescript
async findOrCreateDailyLot(context: IContext): Promise<Lot>
```
- **Description:** Finds an existing daily lot for the current date or creates a new one if none exists. This method implements a mutex pattern to handle concurrent operations safely.
- **Parameters:**
  - `context`: IContext object containing request context
- **Returns:** Promise<Lot> - Returns the found or created daily lot
- **Features:**
  - Mutex handling for concurrent operations
  - Automatic consecutive generation
  - Organization validation
  - Date-based lot management

###### Example Usage
```typescript
const dailyLot = await lotService.findOrCreateDailyLot(context);
```

###### Example Response
```typescript
{
  id: 'lot-123',
  consecutive: 'LOT-20240320-001',
  name: 'Daily Lot 2024-03-20',
  lotType: 'DAILY',
  organizationProduct: {
    id: 'org-prod-123',
    name: 'Example Product'
  },
  createdAt: '2024-03-20T00:00:00Z',
  updatedAt: '2024-03-20T00:00:00Z'
}
```

#### Lifecycle Hooks
- `beforeCreate`: Pre-creation validation and setup
- `afterCreate`: Post-creation operations

#### Event Handlers

##### onFindLotByIdEvent
```typescript
@OnEvent(findLotByIdEvent)
async onFindLotByIdEvent(payload: { context: IContext; id: string }): Promise<Lot>
```
- **Description:** Event handler for finding a lot by ID. This handler is triggered when a lot needs to be retrieved by its unique identifier.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the lot to find
- **Returns:** Promise<Lot> - Returns the found lot
- **Features:**
  - Error handling for not found cases
  - Context validation
  - Organization validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findLotByIdEvent, {
  context,
  id: 'lot-123'
});
```

###### Example Response
```typescript
{
  id: 'lot-123',
  consecutive: 'LOT-001',
  name: 'Daily Lot 2024-03-20',
  lotType: 'DAILY',
  organizationProduct: {
    id: 'org-prod-123',
    name: 'Example Product'
  }
}
```

##### onFindOrCreateDailyLotEvent
```typescript
@OnEvent(findOrCreateDailyLotEvent)
async onFindOrCreateDailyLotEvent(payload: { context: IContext }): Promise<Lot>
```
- **Description:** Event handler for finding or creating a daily lot. This handler manages the creation and retrieval of daily lots, ensuring proper mutex handling and organization validation.
- **Parameters:**
  - `payload.context`: IContext object containing request context
- **Returns:** Promise<Lot> - Returns the found or created daily lot
- **Features:**
  - Mutex handling for concurrent operations
  - Automatic consecutive generation
  - Organization validation
  - Date-based lot management

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findOrCreateDailyLotEvent, {
  context
});
```

###### Example Response
```typescript
{
  id: 'lot-123',
  consecutive: 'LOT-20240320-001',
  name: 'Daily Lot 2024-03-20',
  lotType: 'DAILY',
  organizationProduct: {
    id: 'org-prod-123',
    name: 'Example Product'
  }
}
```

##### onFindLotAndValidateOrganization
```typescript
@OnEvent(findLotEvent)
async onFindLotAndValidateOrganization(payload: { context: IContext; id: string }): Promise<Lot>
```
- **Description:** Event handler for finding a lot and validating its organization association. This handler ensures that the lot belongs to the correct organization before returning it.
- **Parameters:**
  - `payload.context`: IContext object containing request context
  - `payload.id`: ID of the lot to find and validate
- **Returns:** Promise<Lot> - Returns the validated lot
- **Features:**
  - Organization validation
  - Error handling for invalid organizations
  - Context validation

###### Example Usage
```typescript
// Event is emitted from another service
eventEmitter.emit(findLotEvent, {
  context,
  id: 'lot-123'
});
```

###### Example Response
```typescript
{
  id: 'lot-123',
  consecutive: 'LOT-001',
  name: 'Daily Lot 2024-03-20',
  lotType: 'DAILY',
  organizationProduct: {
    id: 'org-prod-123',
    name: 'Example Product'
  }
}
```

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entity/lot.entity.ts`

#### Database Table
- **Table Name:** vudec_lot
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| consecutive | string | No | Unique lot identifier | String! |
| name | string | No | Lot name | String! |
| lotType | LotType | Yes | Type of lot (Daily/Custom) | LotType |

#### Relationships

##### OrganizationProduct
```typescript
@ManyToOne(() => OrganizationProduct, (organization) => organization.lots, {
  lazy: true,
  nullable: false,
})
@Field(() => OrganizationProduct, { nullable: false })
organizationProduct?: OrganizationProduct;
```
- **Type:** Many-to-One
- **Related Entity:** OrganizationProduct
- **Description:** Links lot to organization product
- **Loading:** Lazy loading enabled
- **Nullable:** No

##### LotContracts
```typescript
@OneToMany(() => LotContract, (lotContract) => lotContract.lot, {
  lazy: true,
  nullable: true,
})
@Field(() => [LotContract], { nullable: true })
lotContracts?: LotContract[];
```
- **Type:** One-to-Many
- **Related Entity:** LotContract
- **Description:** Links lot to contracts
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

##### Movements
```typescript
@OneToMany(() => Movement, (movement) => movement.lot, {
  lazy: true,
  nullable: true,
})
@Field(() => [Movement], { nullable: true })
movements?: Movement[];
```
- **Type:** One-to-Many
- **Related Entity:** Movement
- **Description:** Links lot to movements
- **Loading:** Lazy loading enabled
- **Nullable:** Yes

### **Enums (Enumerations)**
Located in `enum/lot-type.enum.ts`

#### LotType
##### Description
Defines the types of lots that can be created in the system. This enumeration distinguishes between daily lots and custom lots.

##### Values
| Value | Description | Use Case |
|-------|-------------|----------|
| Daily | Daily lot | Used for standard daily operations |
| Custom | Custom lot | Used for special or non-daily operations |

### **Constants**
Located in `constants/lot.constants.ts`

#### Description
Defines event constants used for event handling in the lot module. These constants are used to identify different types of lot-related events in the system.

#### Values
```typescript
export const findLotByIdEvent = 'findLotByIdEvent';
export const findOrCreateDailyLotEvent = 'findOrCreateDailyLotEvent';
export const findLotEvent = 'findLotEvent';
```

##### Usage
These constants are used in the event handling system to:
- Trigger lot search operations
- Handle daily lot creation and retrieval
- Manage event-based communication between different parts of the system 