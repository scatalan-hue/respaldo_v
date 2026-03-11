[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Schedule Module Documentation]

# **Module: Schedule**

## **Description**

The Schedule module is a crucial component of the VUDEC system, responsible for managing scheduled tasks and cron jobs. This module provides functionality for creating, updating, and managing schedules, integrating with other system components to ensure timely execution of tasks.

## **Features**

### **Schedule Management**
* Create and manage schedules
* Support for dynamic and static schedules
* Integration with event-driven architecture
* Handle different types of schedules (e.g., NOTIFY_MOVEMENTS, JOB_DUMMY)

## **Constants**

### **Events Constants**
Located in `constants/events.constants.ts`

#### Description
Defines event constants used for handling schedule-related events in the system.

#### Values
```typescript
export const findScheduleByIdEvent = 'findScheduleByIdEvent';
export const findSchedulesEvent = 'findSchedulesEvent';
export const createDynamicScheduleEvent = 'createDynamicScheduleEvent';
export const updateDynamicScheduleEvent = 'updateDynamicScheduleEvent';
```

## **DTOs (Data Transfer Objects)**

### **FindSchedulesArgs**
Located in `dto/args/find-schedule.arg.ts`

#### Description
Arguments type for finding schedules, extending base find arguments.

### **CreateScheduleInput**
Located in `dto/inputs/create-schedule.input.ts`

#### Description
Data Transfer Object for creating a new schedule in the system. Defines the data structure required to create a schedule, including validations.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | Yes | Description of the schedule |
| name | string | Yes | Name of the schedule |
| cronExpression | string | Yes | Cron expression defining the schedule timing |
| type | ScheduleType | Yes | Type of the schedule |
| active | boolean | No | Whether the schedule is active |

### **UpdateScheduleInput**
Located in `dto/inputs/update-schedule.input.ts`

#### Description
Data Transfer Object for updating an existing schedule in the system.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | ID of the schedule to update |

## **Entities**

### **Schedule**
Located in `entities/schedule.entity.ts`

#### Database Table
- **Table Name:** grl_schedule
- **Inherits:** CrudEntity

#### Fields
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| description | string | Yes | Description of the schedule |
| name | string | Yes | Name of the schedule |
| cronExpression | string | Yes | Cron expression for the schedule |
| type | ScheduleType | Yes | Type of the schedule |
| active | boolean | Yes | Whether the schedule is active |

## **Enums (Enumerations)**

### **ScheduleType**
Located in `enums/schedule-type.enum.ts`

#### Description
Defines the types of schedules available in the system.

#### Values
| Value | Description |
|-------|-------------|
| NOTIFY_MOVEMENTS | Schedule for notifying movements |
| JOB_DUMMY | Dummy job schedule |

## **Resolvers**

### **ScheduleResolver**
Located in `resolvers/schedule.resolver.ts`

#### Description
GraphQL resolver for handling schedule operations, including creation, update, and retrieval of schedules.

## **Services**

### **ScheduleService**
Located in `services/schedule.service.ts`

#### Core Methods

##### beforeCreate
```typescript
async beforeCreate(context: IContext, repository: Repository<Schedule>, entity: Schedule, createInput: CreateScheduleInput): Promise<void>
```
- **Description:** Pre-creation validation to ensure no duplicate schedule names exist.

##### afterCreate
```typescript
async afterCreate(context: IContext, repository: Repository<Schedule>, entity: Schedule, createInput: CreateScheduleInput): Promise<void>
```
- **Description:** Post-creation operations, including emitting events for dynamic schedule creation.

##### afterUpdate
```typescript
async afterUpdate(context: IContext, repository: Repository<Schedule>, entity: Schedule, updateInput: UpdateScheduleInput): Promise<void>
```
- **Description:** Post-update operations, including emitting events for dynamic schedule updates.

### **DynamicScheduleService**
Located in `services/dynamic-schedule.service.ts`

#### Description
Service for managing dynamic schedules, including adding and updating cron jobs based on schedule data.

#### Core Methods

##### onApplicationBootstrap
```typescript
async onApplicationBootstrap()
```
- **Description:** Initializes schedules on application startup, adding active cron jobs to the scheduler.

##### addCronJob
```typescript
async addCronJob(context: IContext, id: string, name: string, type: ScheduleType, cronTime: string, description?: string, active?: boolean)
```
- **Description:** Adds a new cron job to the scheduler based on the provided schedule data.

##### updateCronJob
```typescript
async updateCronJob(context: IContext, schedule: Schedule)
```
- **Description:** Updates an existing cron job in the scheduler.

## **Module**

### **ScheduleModule**
Located in `schedule.module.ts`

#### Description
Module that groups all components related to schedule management, including entities, resolvers, services, and DTOs.

#### Providers
- ScheduleService
- DynamicScheduleService
- ScheduleResolver

#### Imports
- TypeOrmModule for the Schedule entity
- NestScheduleModule for scheduling capabilities 