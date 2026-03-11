[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Subscriptions Module Documentation]

# **Module: Suscriptions**

## **Description**

The Suscriptions module is an integral part of the VUDEC system, designed to manage subscription-based messaging and notifications. This module facilitates the creation, management, and delivery of various types of messages and notifications, supporting both progress updates and general notifications.

## **Features**

### **Subscription Management**
* Manage and deliver subscription-based messages
* Support for progress and notification message types
* Integration with event-driven architecture using Redis

## **DTOs (Data Transfer Objects)**

### **GeneralSuscription**
Located in `dto/args/general-message.args.ts`

#### Description
Data Transfer Object for handling general subscription messages, including progress and notification types.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique identifier for the subscription |
| type | TypeMessage | Yes | Type of message (Progress or Notification) |
| subscription | string | Yes | Subscription channel name |
| info | NotificationModel or ProgressModel | No | Additional information for the message |

### **ProgressModel**
Located in `dto/args/general-message.args.ts`

#### Description
Model representing progress-related subscription details.

#### Fields
| Field | Type | Description |
|-------|------|-------------|
| title | string | Title of the progress message |
| description | string | Description of the progress |
| maxItem | number | Maximum number of items |
| currentItem | number | Current number of items processed |
| percentage | string | Completion percentage |

### **NotificationModel**
Located in `dto/args/general-message.args.ts`

#### Description
Model representing notification-related subscription details.

#### Fields
| Field | Type | Description |
|-------|------|-------------|
| title | string | Title of the notification |
| description | string | Description of the notification |
| type | TypeSuscription | Yes | Type of subscription event |

## **Enums (Enumerations)**

### **TypeMessage**
Located in `enums/type-suscription.enum.ts`

#### Description
Defines the types of messages that can be used in subscriptions.

#### Values
| Value | Description |
|-------|-------------|
| Progress | Represents a progress update message |
| Notification | Represents a general notification message |

### **TypeSuscription**
Located in `enums/type-suscription.enum.ts`

#### Description
Defines the types of subscription events that can occur.

#### Values
| Value | Description |
|-------|-------------|
| startProcess | Indicates the start of a process |
| endProcess | Indicates the end of a process |
| common | Represents a common event |
| forceEndProcess | Indicates a forced end of a process |
| error | Represents an error event |
| pause | Indicates a pause in the process |

## **Services**

### **SuscriptionService**
Located in `services/suscription.service.ts`

#### Core Methods

##### messageSuscription
```typescript
public async messageSuscription(data: GeneralSuscription)
```
- **Description:** Publishes a subscription message to the specified channel, determining the message type and handling accordingly.

## **Module**

### **SuscriptionModule**
Located in `suscription.module.ts`

#### Description
Module that encapsulates all components related to subscription management, including services and DTOs.

#### Providers
- SuscriptionService
- PUB_SUB (Redis-based PubSub implementation)

#### Integration
- Utilizes Redis for message brokering and subscription management. 