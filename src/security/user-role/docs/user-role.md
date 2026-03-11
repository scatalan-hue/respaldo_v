[Home](../../../../README.md) > [System Modules Documentation](../../../docs/modules.md) > [Security Module Documentation](../../docs/security.md) > [User Role Module Documentation]

# 🔗 User Role Module Documentation

## 📋 Overview
The User Role module is a core component of the security system that manages the relationship between users and their assigned roles. It provides functionality for creating, managing, and replacing user role assignments within the system. This module is essential for implementing role-based access control (RBAC) in the application.

## 📂 Complete Module Structure
```
src/security/user-role/
├── constants/         # Module-specific constants and event definitions
├── controllers/       # REST controllers for role management
├── dto/              # Data Transfer Objects
│   ├── inputs/       # Input DTOs for operations
│   └── events/       # Event DTOs for system events
├── entities/         # Database entities
├── events/           # Event handlers and processors
├── interfaces/       # Service interfaces and contracts
└── services/         # Business logic services
```

### 🧩 Key Components
- **🛠️ Services**: UserRolesService for role management
- **🗃️ Entities**: UserRole for database representation
- **📝 DTOs**: Input and event DTOs for operations
- **📢 Events**: System events for role validation
- **🔄 Event Handlers**: UserRolesServiceEventHandler for event processing

## ⚙️ Core Features

### 👥 UserRolesService
Main service for managing user role assignments.

#### 🔧 Methods

##### 🆕 createUserRoles
```typescript
async createUserRoles(context: IContext, userId: string, roleIds: string[]): Promise<UserRole[]>
```
- **📝 Purpose**: Creates new role assignments for a user
- **📥 Input**:
  - `context`: IContext containing user and organization info
  - `userId`: ID of the user to assign roles to
  - `roleIds`: Array of role IDs to assign
- **✅ Validations**:
  - User must exist
  - Roles must exist and be valid
  - No duplicate role assignments
- **🔄 Process**:
  1. Validates user existence
  2. Validates each role
  3. Creates role assignments
  4. Returns created assignments
- **📤 Returns**: Array of created UserRole entities
- **❌ Throws**: 
  - BadRequestException if role validation fails
  - NotFoundException if user not found
  - ValidationError for invalid role IDs

##### 🔄 replaceAllUserRoles
```typescript
async replaceAllUserRoles(context: IContext, { userId, roleIds }: ReplaceAllUserRolesInput): Promise<UserRole[]>
```
- **📝 Purpose**: Replaces all roles for a user with new assignments
- **📥 Input**:
  - `context`: IContext containing user and organization info
  - `userId`: ID of the user
  - `roleIds`: Array of new role IDs
- **🔄 Process**:
  1. Removes all existing role assignments
  2. Creates new role assignments if roleIds provided
  3. Validates new role assignments
- **📤 Returns**: Array of new UserRole entities
- **❌ Throws**: 
  - BadRequestException if role validation fails
  - NotFoundException if user not found
  - ValidationError for invalid role IDs

## 🗃️ Database Schema

### 🔄 UserRole Entity
```typescript
@Entity({ name: 'sec_user_role' })
@ObjectType()
export class UserRole extends CrudEntity {
  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, (role) => role.userRoles, { lazy: true, nullable: false })
  role: Role;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.userRoles, { lazy: true, nullable: false })
  user: User;
}
```
- **📊 Table Name**: sec_user_role
- **🔗 Relationships**:
  - Many-to-One with Role entity
  - Many-to-One with User entity
- **✨ Features**:
  - Lazy loading for performance
  - Non-nullable relationships
  - GraphQL type exposure

## 📝 Data Transfer Objects (DTOs)

### 📥 Input DTOs

#### 🔄 ReplaceAllUserRolesInput
```typescript
@InputType()
export class ReplaceAllUserRolesInput {
  @Field(() => [String])
  @IsString({ each: true })
  roleIds?: string[];

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
```
- **📝 Purpose**: Input for replacing all user roles
- **📊 Fields**:
  - `roleIds`: Optional array of role IDs
  - `userId`: Required UUID of the user
- **✅ Validations**:
  - userId must be UUID
  - userId cannot be empty
  - roleIds must be strings if provided
- **🔄 Transformations**:
  - Trims userId value

### 📢 Event DTOs

#### 🆕 CreateUserRolesEventInput
```typescript
@InputType()
export class CreateUserRolesEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => [String])
  @IsString({ each: true })
  roleIds: string[];
}
```
- **📝 Purpose**: Event payload for creating user roles
- **📊 Fields**:
  - `context`: IContext with user and organization info
  - `userId`: UUID of target user
  - `roleIds`: Array of role IDs to assign
- **✅ Validations**:
  - All fields required
  - userId must be UUID
  - roleIds must be strings

#### 🔄 ReplaceAllUserRolesEventInput
```typescript
@InputType()
export class ReplaceAllUserRolesEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => [String])
  @IsString({ each: true })
  roleIds: string[];
}
```
- **📝 Purpose**: Event payload for replacing user roles
- **📊 Fields**:
  - `context`: IContext with user and organization info
  - `userId`: UUID of target user
  - `roleIds`: Array of new role IDs
- **✅ Validations**:
  - All fields required
  - userId must be UUID
  - roleIds must be strings

## 📢 Event System

### 🔄 Event Handlers

#### 👥 UserRolesServiceEventHandler
```typescript
@Injectable()
export class UserRolesServiceEventHandler extends UserRolesService {
  @OnEvent(replaceAllUserRolesEvent)
  async onReplaceAllUserRoles({ context, userId, roleIds }: ReplaceAllUserRolesEventInput): Promise<UserRole[]>

  @OnEvent(createUserRolesEvent)
  async onCreateUserRoles({ context, userId, roleIds }: CreateUserRolesEventInput): Promise<UserRole[]>
}
```
- **📝 Purpose**: Handles role-related events
- **📢 Events**:
  - `replaceAllUserRolesEvent`: Replaces all user roles
  - `createUserRolesEvent`: Creates new role assignments
- **🔄 Process**:
  1. Receives event with context and data
  2. Validates input data
  3. Executes corresponding service method
  4. Returns result

### 🔑 Event Constants
```typescript
export const createUserRolesEvent = 'createUserRoles';
export const replaceAllUserRolesEvent = 'replaceAllUserRoles';
```

## 🔐 Security Features
- ✅ Role validation before assignment
- 🔒 Context-based access control
- 🔄 Event-based validation system
- 🚀 Lazy loading of related entities
- 🆔 UUID validation for IDs
- 🧹 Input sanitization (trimming)
- 📝 Type validation for role IDs

## 🔄 Integration Points
- 👥 Users Module: For user validation and management
- 🛡️ Roles Module: For role validation and management
- 📢 Event System: For cross-module communication
- 🎯 GraphQL: For API exposure
- 🗃️ TypeORM: For database operations

## ⚠️ Error Handling
- ❌ BadRequestException for invalid role assignments
- ❓ Validation errors for non-existent users/roles
- 📢 Event handling errors for cross-module operations
- 🆔 UUID validation errors
- 🚫 Empty input validation errors
- 📝 Type validation errors for role IDs

## 📋 Usage Examples

### 🆕 Creating User Roles
```typescript
// Direct service usage
const userRoles = await userRolesService.createUserRoles(
  context,
  userId,
  ['role-id-1', 'role-id-2']
);

// Event-based usage
await eventEmitter.emit(createUserRolesEvent, {
  context,
  userId,
  roleIds: ['role-id-1', 'role-id-2']
});
```

### 🔄 Replacing User Roles
```typescript
// Direct service usage
const newRoles = await userRolesService.replaceAllUserRoles(
  context,
  {
    userId: 'user-id',
    roleIds: ['new-role-id-1', 'new-role-id-2']
  }
);

// Event-based usage
await eventEmitter.emit(replaceAllUserRolesEvent, {
  context,
  userId: 'user-id',
  roleIds: ['new-role-id-1', 'new-role-id-2']
});
```

## ⚙️ Configuration
No specific configuration required. The module uses:
- 📢 Event emitter for cross-module communication
- 🗃️ TypeORM for database operations
- 🎯 GraphQL decorators for API exposure
- ✅ Class-validator for input validation
- 🔄 Class-transformer for data transformation

## 🔧 Troubleshooting
Common issues and solutions:

1. **🚫 Role Assignment Fails**
   - Verify user exists
   - Verify roles exist
   - Check role validation events
   - Validate UUID format
   - Check role IDs are strings

2. **⚡ Performance Issues**
   - Check lazy loading configuration
   - Monitor event handling performance
   - Review database indexes
   - Optimize role queries
   - Monitor event queue size

3. **❌ Validation Errors**
   - Verify context contains required information
   - Check role and user existence
   - Validate role permissions
   - Check UUID format
   - Verify role IDs are valid strings

4. **📢 Event Processing Issues**
   - Check event emitter configuration
   - Verify event payload structure
   - Monitor event handler performance
   - Check event registration
   - Validate event context 