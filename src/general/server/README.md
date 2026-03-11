[Home](../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Server Module Documentation]

# **Module: Server**

## **Description**

The Server module is a key component of the VUDEC system, responsible for managing server configurations and operations. This module provides functionality for creating, updating, and retrieving server details, ensuring seamless integration with other system components.

## **Features**

### **Server Management**
* Create and manage server configurations
* Support for secure and non-secure servers
* Integration with event-driven architecture

## **Constants**

### **Event Constants**
Located in `constants/event.constant.ts`

#### Description
Defines event constants used for handling server-related events in the system.

#### Values
```typescript
export const serverModelEvent = 'serverModelEvent';
```

## **DTOs (Data Transfer Objects)**

### **CreateServerInput**
Located in `dto/inputs/create-server.input.ts`

#### Description
Data Transfer Object for creating a new server configuration in the system. Defines the data structure required to create a server, including validations.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Unique code for the server |
| description | string | Yes | Description of the server |
| host | string | Yes | Host address of the server |
| port | number | Yes | Port number for the server |
| url | string | No | Optional URL for the server |
| secure | boolean | Yes | Whether the server is secure |

### **UpdateServerInput**
Located in `dto/inputs/update-server.input.ts`

#### Description
Data Transfer Object for updating an existing server configuration in the system.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | ID of the server to update |

### **ServerModel**
Located in `dto/models/server-configuration.model.ts`

#### Description
Model representing the server configuration details.

#### Fields
| Field | Type | Description |
|-------|------|-------------|
| host | string | Host address of the server |
| port | number | Port number for the server |
| url | string | URL of the server |
| secure | boolean | Whether the server is secure |

## **Entities**

### **Server**
Located in `entities/server.entity.ts`

#### Database Table
- **Table Name:** grl_server
- **Inherits:** CrudEntity

#### Fields
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| code | string | No | Unique code for the server |
| description | string | No | Description of the server |
| host | string | No | Host address of the server |
| port | number | No | Port number for the server |
| url | string | Yes | Optional URL for the server |
| secure | boolean | No | Whether the server is secure |

## **Resolvers**

### **ServerResolver**
Located in `resolver/server.resolver.ts`

#### Description
GraphQL resolver for handling server operations, including creation, update, and retrieval of server configurations.

## **Services**

### **ServerService**
Located in `service/server.service.ts`

#### Core Methods

##### findModel
```typescript
public async findModel({ context, code }: { context: IContext; code: string }): Promise<ServerModel>
```
- **Description:** Retrieves the server model based on the provided code, ensuring the server exists.

## **Module**

### **ServerModule**
Located in `server.module.ts`

#### Description
Module that groups all components related to server management, including entities, resolvers, services, and DTOs.

#### Providers
- ServerService
- ServerResolver

#### Imports
- TypeOrmModule for the Server entity 