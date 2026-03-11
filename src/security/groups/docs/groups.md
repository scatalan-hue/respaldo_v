[Home](../../../../README.md) > [System Modules Documentation](../../../docs/modules.md) > [Security Module Documentation](../../docs/security.md) > [Groups Module Documentation]

# 📘 Groups Module — Full Technical Documentation

This module handles the **Groups** functionality within the system. It is built using **NestJS**, **GraphQL**, **TypeORM**, and follows a **CRUD pattern** using mixins and service/resolver structure factories. It also integrates with event-driven logic using `@OnEvent`.

---

## 📦 Module Overview — `groups.module.ts`

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Group]), HttpModule, NotificationConfigModule],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService],
})
export class GroupsModule {}
```

### Responsibilities:
- Registers the `Group` entity with TypeORM.
- Provides the service and resolver used for CRUD operations.
- Exports `GroupsService` for external usage.
- Integrates with `NotificationConfigModule`.

---

## 🧠 Entity Definition — `groups.entity.ts`

```ts
@Entity('sec_group')
@ObjectType()
export class Group extends CrudEntity {
  @Column()
  @Field()
  name: string;

  @ManyToOne(() => NotificationConfig, (item) => item.id, {
    lazy: true,
    nullable: true,
  })
  @Field(() => NotificationConfig, { nullable: true })
  notificationConfig?: NotificationConfig;

  @ManyToMany(() => User, { lazy: true, nullable: true })
  @Field(() => [User], { nullable: true })
  @JoinTable({ name: 'sec_groupUser' })
  users?: User[];
}
```

### Fields:
- `name` (string): The name of the group. Required.
- `notificationConfig` (relation): Optional relation to a notification configuration entity.
- `users` (many-to-many): Optional list of users associated with this group.

The entity extends a base class `CrudEntity` which likely includes:
- `id`, `createdAt`, `updatedAt`, etc.

---

## 📥 DTOs — Input Definitions

### `create-groups.input.ts`

```ts
@InputType()
export class CreateGroupInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  notificationConfigId?: string;
}
```

### Fields:
- `name` (string, required): Group name.
- `notificationConfigId` (UUID, optional): ID of a related notification configuration.

### Example Usage:

```graphql
mutation {
  createGroup(input: {
    name: "Admin Group",
    notificationConfigId: "f4d2fbd4-30f6-4b8d-93bc-abc123ef4567"
  }) {
    id
    name
  }
}
```

---

### `update-groups.input.ts`

```ts
@InputType()
export class UpdateGroupInput extends PartialType(CreateGroupInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
```

Extends the create input with all fields optional, and adds:
- `id` (string, required): ID of the group to update.

### Example Usage:

```graphql
mutation {
  updateGroup(input: {
    id: "c3f4efb4-10bb-43b1-bcde-xyz123abc789",
    name: "Updated Group"
  }) {
    id
    name
  }
}
```

---

## 🧠 Groups Service — `groups.service.ts`

This service extends a base `CrudService` and adds **hooks and event listeners**.

### ✅ Hook: `beforeCreate`

```ts
async beforeCreate(context, repo, entity, input) {
  if (input.notificationConfigId)
    entity.notificationConfig = await this.notificationConfigService.findOne(context, input.notificationConfigId, true);
}
```

Adds a notification configuration to the group before saving.

### ✅ Hook: `beforeUpdate`

```ts
async beforeUpdate(context, repo, entity, input) {
  if (input.notificationConfigId)
    entity.notificationConfig = await this.notificationConfigService.findOne(context, input.notificationConfigId, true);
}
```

Same as `beforeCreate`, but during update.

### 📣 Event: `findOneById`

```ts
@OnEvent('findGroupById')
async findOneById({ context, input }) {
  return await this.findOne(context, input, true);
}
```

Used to retrieve a group by ID via internal event.

### 📣 Event: `findByNotification`

```ts
@OnEvent('findGroupByNotification')
async findByNotification({ context, input }) {
  return await this.getRepository(context).findBy({ notificationConfig: { id: input } });
}
```

Used to retrieve all groups associated with a specific notification config ID.

---

## 🧬 Resolver — `groups.resolver.ts`

```ts
@Resolver(() => Group)
export class GroupsResolver extends CrudResolverFrom(resolverStructure) {}
```

The resolver is generated using a `CrudResolverFrom()` function with configuration for:

- `createGroup`: Requires admin
- `updateGroup`: Requires admin
- `removeGroup`: Requires admin
- `group`: Public access
- `groups`: Public access

### Example Queries

```graphql
query {
  groups {
    id
    name
  }
}
```

```graphql
mutation {
  removeGroup(id: "some-uuid") {
    id
  }
}
```

---

## 📣 Event Constants — `events.constants.ts`

```ts
export const findGroupById = 'findGroupById';
export const findGroupByNotification = 'findGroupByNotification';
```

Used by `@OnEvent()` in the service for decoupled logic.

---

## 🛠 Usage in Code

### Registering a Group

```ts
const group = await groupsService.create(context, {
  name: 'New Team',
  notificationConfigId: 'config-id'
});
```

### Listening to Events

```ts
eventEmitter.emit(findGroupByNotification, {
  context,
  input: 'notification-config-id'
});
```

---

## ✅ Summary

This module provides a complete, extensible, and event-driven structure for managing groups in the system:

- 🎯 CRUD-ready
- 🧠 Logic hooks for pre-processing
- 🌐 GraphQL-ready
- 🔁 Event-integrated

Perfect for onboarding new developers with a clean modular architecture and reusable patterns.

---
