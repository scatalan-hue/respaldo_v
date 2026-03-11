# **Module: NotificationGroup**

## **Description**

The NotificationGroup module is an integral part of the VUDEC system, designed to manage groups of notifications. This module provides functionality for creating and managing notification groups, handling different states and types of notification groups, and integrating with other system components for comprehensive notification management.

## **Features**

### **Notification Group Management**
* Create and manage notification groups
* Handle different states of notification groups (Draft, Process, Complete, etc.)
* Support for automatic and manual group types
* Integration with notification and subscription services

## **Consumers**

### **NotificationGroupConsumer**
Located in `consumers/notification-group.consumer.ts`

#### Description
Handles the processing of notification groups using Bull queues. It manages the lifecycle of notification group jobs, including creation and processing.

#### Methods

##### onActive
```typescript
async onActive(job: Job)
```
- **Description:** Triggered when a job becomes active. Sends a subscription message indicating the start of the process.
- **Parameters:**
  - `job`: Job object containing job data

##### createNotificationGroup
```typescript
async createNotificationGroup(job: Job)
```
- **Description:** Processes the creation of a notification group, filling it with data and handling errors.
- **Parameters:**
  - `job`: Job object containing job data

## **Services**

### **NotificationGroupService**
Located in `services/notification-group.service.ts`

#### Core Methods

##### afterCreate
```typescript
async afterCreate(context: IContext, repository: Repository<NotificationGroup>, entity: NotificationGroup, createInput: CreateNotificationGroupInput): Promise<void>
```
- **Description:** Post-creation operations for a notification group, including linking to notification configurations and groups.
- **Parameters:**
  - `context`: IContext object containing request context
  - `repository`: Repository for NotificationGroup
  - `entity`: NotificationGroup entity
  - `createInput`: CreateNotificationGroupInput containing the configuration data

##### fillGroup
```typescript
async fillGroup(context: IContext, entity: NotificationGroup, createInput: CreateNotificationGroupInput)
```
- **Description:** Fills a notification group with users and creates notifications for each user in the group.
- **Parameters:**
  - `context`: IContext object containing request context
  - `entity`: NotificationGroup entity
  - `createInput`: CreateNotificationGroupInput containing the configuration data

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/notification-group.entity.ts`

#### Database Table
- **Table Name:** msg_notificationGroup
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| name | string | No | Name of the notification group | String |
| typeNotificationGroup | TypeNotificationGroup | No | Type of the notification group (Automatic, Manual) | TypeNotificationGroup |
| stateNotificationGroup | StateNotificationGroup | No | State of the notification group (Draft, Process, etc.) | StateNotificationGroup |
| notificationConfig | NotificationConfig | No | Associated notification configuration | NotificationConfig |
| group | Group | No | Associated group | Group |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-notification-group.input.ts`, `dto/inputs/update-notification-group.input.ts`

#### CreateNotificationGroupInput
##### Description
Data Transfer Object for creating a new notification group in the system. Defines the data structure required to create a group, including validations.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| name | string | Yes | Name of the notification group | - IsString |
| metadata | string | No | Additional metadata for the group | - IsString |
| notificationConfigId | string | Yes | ID of the associated notification configuration | - IsUUID |
| groupId | string | No | ID of the associated group | - IsUUID |

#### UpdateNotificationGroupInput
##### Description
Data Transfer Object for updating an existing notification group in the system.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| id | string | Yes | ID of the notification group | - IsUUID |

### **Enums (Enumerations)**
Located in `enums/type-notification-group.enum.ts`, `enums/state-notification-group.enum.ts`

#### TypeNotificationGroup
##### Description
Defines the types of notification groups available in the system.

##### Values
| Value | Description |
|-------|-------------|
| Automatic | Automatically managed notification groups |
| Manual | Manually managed notification groups |

#### StateNotificationGroup
##### Description
Defines the states of notification groups available in the system.

##### Values
| Value | Description |
|-------|-------------|
| Draft | Notification group is in draft state |
| Process | Notification group is being processed |
| PartialComplete | Notification group is partially complete |
| Complete | Notification group is complete |
| Error | Notification group encountered an error |

## **Module**

### **NotificationGroupModule**
Located in `notification-group.module.ts`

#### Description
Module that groups all components related to notification group management, including entities, resolvers, services, and DTOs.

#### Providers
- NotificationGroupService
- NotificationGroupResolver

#### Imports
- TypeOrmModule for the NotificationGroup entity
- HttpModule for HTTP requests
- NotificationConfigModule for configuration management
- NotificationModule for notification management
- SuscriptionModule for subscription management

#### Exports
- NotificationGroupService 