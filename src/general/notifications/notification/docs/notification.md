[Home](../../../../../../README.md) > [General Module Documentation](../../../docs/general.md) > [Notification Module Documentation]

# **Module: Notification**

## **Description**

The Notification module is a fundamental component of the VUDEC system that manages all operations related to notifications. This module provides comprehensive functionality for notification management, including creation, processing, and delivery of notifications through various channels such as email, SMS, and web sockets. It is designed to integrate seamlessly with other system components, ensuring data consistency, security, and efficient notification delivery.

## **Features**

### **Notification Management**
* Create, process, and deliver notifications
* Support for multiple notification channels (Email, SMS, WSS, Push)
* Manage notification states and persistence
* Implement data integrity checks
* Maintain audit trails

## **Controllers / Resolvers / Consumers**

### **Consumers**
Located in `consumers/notification.consumer.ts`

#### Queue Processing

##### createNotification
Processes jobs from the notification queue to create notifications. This consumer handles the creation and processing of notifications based on queued jobs.

###### Events
- **OnQueueActive:** Logs when a job is active
- **OnQueueFailed:** Logs when a job fails
- **OnQueueCompleted:** Logs when a job is completed

### **Resolvers**
Located in `resolvers/notification.resolver.ts`

#### GraphQL Operations

##### Queries

###### notification
```graphql
query Notification($id: ID!) {
  notification(id: $id) {
    id
    type
    stateNotification
    user {
      id
      name
    }
  }
}
```
- **Description:** Retrieves a specific notification by ID, including basic information and user details.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the notification to retrieve
- **Returns:** Promise<Notification> - Returns the found notification

## **Services**

### **NotificationService**
Located in `services/notification.service.ts`

#### Core Methods

##### create
```typescript
async create(context: IContext, createNotificationInput: CreateNotificationInput): Promise<Notification>
```
- **Description:** Creates a new notification in the system.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createNotificationInput`: CreateNotificationInput containing the notification data
- **Returns:** Promise<Notification> - Returns the created notification

##### createNotificationByGroup
```typescript
async createNotificationByGroup(context: IContext, users: User[], notificationGroup: NotificationGroup, notificationConfigId: string, metadata: string)
```
- **Description:** Creates notifications for a group of users based on a notification configuration.
- **Parameters:**
  - `context`: IContext object containing request context
  - `users`: Array of User objects to notify
  - `notificationGroup`: NotificationGroup object
  - `notificationConfigId`: ID of the notification configuration
  - `metadata`: Additional metadata for the notifications
- **Returns:** Promise<void> - Indicates successful creation

##### notificationCountByUser
```typescript
async notificationCountByUser(context: IContext, userId: string)
```
- **Description:** Counts notifications for a specific user and updates their state.
- **Parameters:**
  - `context`: IContext object containing request context
  - `userId`: ID of the user to count notifications for
- **Returns:** Promise<void> - Indicates successful count and update

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/notification.entity.ts`

#### Database Table
- **Table Name:** msg_notification
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| type | TypeNotification | No | Type of the notification | TypeNotification |
| user | User | Yes | User associated with the notification | User |
| metadata | string | Yes | Additional metadata for the notification | String |
| hasPersistent | boolean | No | Indicates if the notification is persistent | Boolean |
| persistentExpiration | Date | Yes | Expiration date for persistent notifications | Date |
| statePersistent | StatePersistent | Yes | State of the persistent notification | StatePersistent |
| stateNotification | StateNotification | No | Current state of the notification | StateNotification |
| notificationConfig | NotificationConfig | No | Configuration for the notification | NotificationConfig |
| notificationGroup | NotificationGroup | Yes | Group associated with the notification | NotificationGroup |
| externalId | string | Yes | External ID for the notification | String |
| externalMessage | string | Yes | External message for the notification | String |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-notification.input.ts`, `dto/inputs/update-notification.input.ts`

#### CreateNotificationInput
##### Description
Data Transfer Object for creating a new notification in the system. Defines the data structure required to create a notification, including validations.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| type | TypeNotification | Yes | Type of the notification | - IsEnum(TypeNotification) |
| userId | string | No | ID of the user associated with the notification | - IsUUID |
| emailRecipients | EmailRecipient[] | No | List of email recipients | - IsArray |
| smsRecipient | SmsRecipient | No | SMS recipient | - IsOptional |
| wssRecipient | WssRecipient | No | WSS recipient | - IsOptional |
| typeConfig | NotificationTypes | Yes | Configuration type for the notification | - IsEnum(NotificationTypes) |
| subtypeConfig | string | Yes | Subtype configuration for the notification | - IsString |
| metadata | string | No | Additional metadata for the notification | - IsString |
| notificationGroupId | string | No | ID of the notification group | - IsUUID |
| notificationGroupName | string | No | Name of the notification group | - IsString |
| subject | string | No | Subject of the notification | - IsString |
| profileId | string | No | ID of the profile associated with the notification | - IsUUID |

#### UpdateNotificationInput
##### Description
Data Transfer Object for updating an existing notification in the system.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| id | string | Yes | ID of the notification | - IsUUID |

### **Enums (Enumerations)**
Located in `enums/type-notification.enum.ts`, `enums/state-notification.enum.ts`, `enums/state-persistent.enum.ts`

#### TypeNotification
##### Description
Defines the types of notifications available in the system.

##### Values
| Value | Description |
|-------|-------------|
| Email | Email notification |
| Sms | SMS notification |
| Wss | WebSocket notification |
| Push | Push notification |
| Subscription | Subscription notification |

#### StateNotification
##### Description
Defines the states a notification can be in.

##### Values
| Value | Description |
|-------|-------------|
| Draft | Notification is in draft state |
| Complete | Notification is complete |
| Error | Notification encountered an error |

#### StatePersistent
##### Description
Defines the states of persistent notifications.

##### Values
| Value | Description |
|-------|-------------|
| Send | Notification has been sent |
| Receive | Notification has been received |
| Open | Notification has been opened |
| NoPersistent | Notification is not persistent |

## **Module**

### **NotificationModule**
Located in `notification.module.ts`

#### Description
Module that groups all components related to notification management, including entities, resolvers, services, consumers, and DTOs.

#### Providers
- NotificationService
- NotificationResolver
- NotificationConsumer
- PUB_SUB (RedisPubSub for GraphQL subscriptions)

#### Imports
- TypeOrmModule for the Notification entity
- HttpModule for HTTP requests
- BullModule for job queues
- ProfileModule, EmailModule, SmsModule for external API integrations

#### Exports
- NotificationService
- PUB_SUB 