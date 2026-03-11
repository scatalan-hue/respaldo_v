# **Module: NotificationConfig**

## **Description**

The NotificationConfig module is a crucial part of the VUDEC system, responsible for managing notification configurations. This module provides comprehensive functionality for defining and managing notification settings, including types, subtypes, and delivery methods. It ensures that notifications are configured correctly to meet the system's requirements and integrates seamlessly with other components.

## **Features**

### **Notification Configuration Management**
* Define and manage notification types and subtypes
* Configure delivery methods (Email, SMS, WSS, Push)
* Validate notification settings
* Ensure data integrity and consistency

## **Resolvers**

### **NotificationConfigResolver**
Located in `resolvers/notification-config.resolver.ts`

#### GraphQL Operations

##### Queries

###### notificationConfig
```graphql
query NotificationConfig($id: ID!) {
  notificationConfig(id: $id) {
    id
    name
    type
    subtype
    hasEmail
    hasSms
    hasWss
    hasPush
  }
}
```
- **Description:** Retrieves a specific notification configuration by ID, including its settings and delivery methods.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the notification configuration to retrieve
- **Returns:** Promise<NotificationConfig> - Returns the found notification configuration

## **Services**

### **NotificationConfigService**
Located in `services/notification-config.service.ts`

#### Core Methods

##### create
```typescript
async create(context: IContext, createNotificationConfigInput: CreateNotificationConfigInput): Promise<NotificationConfig>
```
- **Description:** Creates a new notification configuration in the system.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createNotificationConfigInput`: CreateNotificationConfigInput containing the configuration data
- **Returns:** Promise<NotificationConfig> - Returns the created notification configuration

##### findOneByType
```typescript
async findOneByType({ context, profileId, type, subtype, orFail }: { context: IContext; profileId: string; type: NotificationTypes; subtype: string; orFail?: boolean; }): Promise<NotificationConfig>
```
- **Description:** Finds a notification configuration by type and subtype.
- **Parameters:**
  - `context`: IContext object containing request context
  - `profileId`: ID of the profile
  - `type`: Type of the notification
  - `subtype`: Subtype of the notification
  - `orFail`: Whether to throw an error if not found
- **Returns:** Promise<NotificationConfig> - Returns the found notification configuration

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/notification-config.entity.ts`

#### Database Table
- **Table Name:** msg_notificationConfig
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| name | string | No | Name of the notification configuration | String |
| profile | Profile | No | Profile associated with the configuration | Profile |
| type | NotificationTypes | No | Type of the notification | NotificationTypes |
| subtype | string | No | Subtype of the notification | String |
| hasEmail | boolean | No | Indicates if email delivery is enabled | Boolean |
| hasSms | boolean | No | Indicates if SMS delivery is enabled | Boolean |
| hasWss | boolean | No | Indicates if WSS delivery is enabled | Boolean |
| hasPush | boolean | No | Indicates if Push delivery is enabled | Boolean |
| hasPersistent | boolean | No | Indicates if the notification is persistent | Boolean |
| persistentExpiration | Date | Yes | Expiration date for persistent notifications | Date |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-notification-config.input.ts`, `dto/inputs/update-notification-config.input.ts`

#### CreateNotificationConfigInput
##### Description
Data Transfer Object for creating a new notification configuration in the system. Defines the data structure required to create a configuration, including validations.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| name | string | Yes | Name of the notification configuration | - IsString |
| profileId | string | Yes | ID of the profile associated with the configuration | - IsUUID |
| type | NotificationTypes | Yes | Type of the notification | - IsEnum(NotificationTypes) |
| subtype | string | Yes | Subtype of the notification | - IsString |
| hasEmail | boolean | No | Indicates if email delivery is enabled | - IsBoolean |
| hasSms | boolean | No | Indicates if SMS delivery is enabled | - IsBoolean |
| hasWss | boolean | No | Indicates if WSS delivery is enabled | - IsBoolean |
| hasPush | boolean | No | Indicates if Push delivery is enabled | - IsBoolean |

#### UpdateNotificationConfigInput
##### Description
Data Transfer Object for updating an existing notification configuration in the system.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| id | string | Yes | ID of the notification configuration | - IsUUID |

### **Enums (Enumerations)**
Located in `enums/notification-type.enum.ts`, `enums/notification-subtype.enum.ts`

#### NotificationTypes
##### Description
Defines the types of notifications available in the system.

##### Values
| Value | Description |
|-------|-------------|
| Token | Token-based notifications |
| General | General notifications |

#### NotificationSubtypes
##### Description
Defines the subtypes of notifications available in the system.

##### Values
| Value | Description |
|-------|-------------|
| signUp | Sign-up notifications |
| notifyStamps | Notifications for stamp updates |
| recoverPassword | Password recovery notifications |
| validateJwt | JWT validation notifications |
| temporalPassword | Temporary password notifications |

## **Module**

### **NotificationConfigModule**
Located in `notification-config.module.ts`

#### Description
Module that groups all components related to notification configuration management, including entities, resolvers, services, and DTOs.

#### Providers
- NotificationConfigService
- NotificationConfigResolver

#### Imports
- TypeOrmModule for the NotificationConfig entity
- HttpModule for HTTP requests
- ProfileModule for profile management

#### Exports
- NotificationConfigService 