[Home](../../../../../README.md) > [System Modules Documentation](../../../../docs/modules.md) > [Security Module Documentation](../../../docs/security.md) > [Role Module Documentation]

# Role Module Documentation

## Overview
The Role module is a fundamental security component that manages user roles and their associated functionalities within the system. This module is essential for implementing role-based access control (RBAC) and permission management in the application.

### Main Purpose
- Role management and assignment
- Functionality association with roles
- Role-based access control
- Permission validation
- Role hierarchy management

### System Importance
- Centralizes role management logic
- Provides secure permission mechanisms
- Integrates with user authentication
- Maintains system security through role-based access

## Complete Module Structure
```
src/security/roles/role/
├── constants/           # Module constants
│   └── events.constants.ts      # Event definitions
├── controllers/        # REST controllers
├── dto/               # Data Transfer Objects
│   ├── events/        # Event DTOs
│   └── inputs/        # Input DTOs
├── entities/          # Database entities
├── functions/         # Utility functions
├── resolvers/         # GraphQL resolvers
├── services/          # Business services
├── utils/            # Helper utilities
└── role.module.ts     # Module definition
```

## Key Components

### Services
- **RolesService**: Main service for role management
  - Handles role CRUD operations
  - Manages role-functionality associations
  - Processes role validation events
- **RolesFxService**: Service for role-functionality management
  - Handles role-functionality relationships
  - Manages URL associations
  - Processes role-functionality events

### Resolvers
- **RolesResolver**: GraphQL resolver for role operations
  - Exposes role management endpoints
  - Handles role-related queries and mutations
- **RoleFxResolver**: GraphQL resolver for role-functionality operations
  - Manages role-functionality relationships
  - Handles URL associations

### Entities
- **Role**: Main entity for role storage
  - Stores role information
  - Manages user and functionality relationships
- **RoleFx**: Entity for role-functionality relationships
  - Links roles with functionalities
  - Manages URL associations

## Core Features

### RolesService

#### createRole
```typescript
async createRole(context: IContext, createRoleInput: CreateRoleInput): Promise<Role>
```
- **Purpose**: Creates a new role in the system
- **Parameters**:
  - `context`: Operation context
  - `createRoleInput`: Role creation data
- **Process**:
  1. Validates role name uniqueness
  2. Creates new role record
  3. Saves to database
- **Returns**: Created Role entity
- **Throws**:
  - BadRequestException if role name exists

#### functionalitiesByRole
```typescript
async functionalitiesByRole(
  context: IContext, 
  role: Role, 
  idRole?: string
): Promise<Functionality[]>
```
- **Purpose**: Retrieves functionalities associated with a role
- **Parameters**:
  - `context`: Operation context
  - `role`: Role entity
  - `idRole`: Optional role ID
- **Process**:
  1. Resolves role if needed
  2. Fetches associated functionalities
  3. Returns functionality list
- **Returns**: Array of Functionality entities

### RolesFxService

#### replaceAllRolesFx
```typescript
async replaceAllRolesFx(
  context: IContext, 
  { rolesFx, roleId }: CreateAndRemoveRoleFxInput
): Promise<RoleFx[]>
```
- **Purpose**: Replaces all role-functionality associations
- **Parameters**:
  - `context`: Operation context
  - `rolesFx`: New role-functionality associations
  - `roleId`: Target role ID
- **Process**:
  1. Removes existing associations
  2. Creates new associations
  3. Updates URLs if needed
- **Returns**: Array of new RoleFx entities

### Resolvers

#### RolesResolver
```typescript
@Resolver(() => Role)
export class RolesResolver extends CrudResolverFrom(resolverStructure)
```

##### createRole
```typescript
@Mutation(() => Role, { name: 'createRole' })
@AdminOnly()
async createRole(
  @CurrentContext() context: IContext,
  @Args('createRoleInput') createRoleInput: CreateRoleInput,
): Promise<Role>
```
- **Purpose**: Creates a new role through GraphQL
- **Parameters**:
  - `context`: Operation context
  - `createRoleInput`: Role creation data
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: Created Role entity
- **GraphQL Mutation**:
```graphql
mutation {
  createRole(createRoleInput: {
    name: "Admin"
    description: "Administrator role"
  }) {
    id
    name
    description
  }
}
```

##### role
```typescript
@Query(() => Role, { name: 'role' })
@AdminOnly()
async findOne(
  @CurrentContext() context: IContext,
  @Args('id') id: string,
): Promise<Role>
```
- **Purpose**: Retrieves a single role by ID
- **Parameters**:
  - `context`: Operation context
  - `id`: Role identifier
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: Role entity
- **GraphQL Query**:
```graphql
query {
  role(id: "role-uuid") {
    id
    name
    description
    isActive
  }
}
```

##### roles
```typescript
@Query(() => [Role], { name: 'roles' })
@AdminOnly()
async findAll(
  @CurrentContext() context: IContext,
  @Args('skip', { nullable: true }) skip?: number,
  @Args('take', { nullable: true }) take?: number,
  @Args('where', { nullable: true }) where?: FindOptionsWhere<Role>,
  @Args('order', { nullable: true }) order?: FindOptionsOrder<Role>,
): Promise<Role[]>
```
- **Purpose**: Retrieves a list of roles with pagination and filtering
- **Parameters**:
  - `context`: Operation context
  - `skip`: Number of records to skip
  - `take`: Number of records to take
  - `where`: Filter conditions
  - `order`: Sorting options
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: Array of Role entities
- **GraphQL Query**:
```graphql
query {
  roles(
    skip: 0
    take: 10
    where: { isActive: true }
    order: { name: ASC }
  ) {
    id
    name
    description
    isActive
  }
}
```

#### RoleFxResolver
```typescript
@Resolver(() => RoleFx)
export class RoleFxResolver extends CrudResolverFrom(resolverStructure)
```

##### replaceAllRolesFx
```typescript
@Mutation(() => [RoleFx], { name: 'replaceAllRolesFx' })
@AdminOnly()
async replaceAllRolesFx(
  @CurrentContext() context: IContext,
  @Args('replaceAllRolesFxInput') replaceAllRolesFxInput: CreateAndRemoveRoleFxInput,
): Promise<RoleFx[]>
```
- **Purpose**: Replaces all role-functionality associations
- **Parameters**:
  - `context`: Operation context
  - `replaceAllRolesFxInput`: Input containing role ID and new associations
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: Array of updated RoleFx entities
- **GraphQL Mutation**:
```graphql
mutation {
  replaceAllRolesFx(replaceAllRolesFxInput: {
    roleId: "role-uuid"
    rolesFx: [{
      permission: "security.users.create"
      urls: ["/api/users"]
    }]
  }) {
    id
    permission
    urls
  }
}
```

##### roleFx
```typescript
@Query(() => RoleFx, { name: 'roleFx' })
@AdminOnly()
async findOne(
  @CurrentContext() context: IContext,
  @Args('id') id: string,
): Promise<RoleFx>
```
- **Purpose**: Retrieves a single role-functionality association
- **Parameters**:
  - `context`: Operation context
  - `id`: RoleFx identifier
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: RoleFx entity
- **GraphQL Query**:
```graphql
query {
  roleFx(id: "role-fx-uuid") {
    id
    permission
    urls
  }
}
```

##### rolesFx
```typescript
@Query(() => [RoleFx], { name: 'rolesFx' })
@AdminOnly()
async findAll(
  @CurrentContext() context: IContext,
  @Args('skip', { nullable: true }) skip?: number,
  @Args('take', { nullable: true }) take?: number,
  @Args('where', { nullable: true }) where?: FindOptionsWhere<RoleFx>,
  @Args('order', { nullable: true }) order?: FindOptionsOrder<RoleFx>,
): Promise<RoleFx[]>
```
- **Purpose**: Retrieves a list of role-functionality associations
- **Parameters**:
  - `context`: Operation context
  - `skip`: Number of records to skip
  - `take`: Number of records to take
  - `where`: Filter conditions
  - `order`: Sorting options
- **Decorators**:
  - @AdminOnly(): Restricts access to admin users
- **Returns**: Array of RoleFx entities
- **GraphQL Query**:
```graphql
query {
  rolesFx(
    skip: 0
    take: 10
    where: { role: { id: "role-uuid" } }
    order: { permission: ASC }
  ) {
    id
    permission
    urls
  }
}
```

### Controllers

#### RoleController
```typescript
@Controller('role')
@ApiTags('Role')
export class RoleController
```

##### roleAndFunctionalities
```typescript
@Get('functionalities/:idRole')
@ApiParam({ name: 'idRole', description: 'id role' })
async roleAndFunctionalities(
  @CurrentContext() context: IContext,
  @Param('idRole') idRole: string,
): Promise<Functionality[]>
```
- **Purpose**: Retrieves functionalities associated with a role
- **Endpoint**: GET /role/functionalities/:idRole
- **Parameters**:
  - `context`: Operation context
  - `idRole`: Role identifier
- **Returns**: Array of Functionality entities
- **Example Request**:
```http
GET /role/functionalities/role-uuid
```
- **Example Response**:
```json
[
  {
    "id": "functionality-uuid",
    "key": "security.users.create",
    "name": "Create Users",
    "description": "Permission to create new users"
  }
]
```

## Database Schema

### Role Entity
```typescript
@Entity('sec_role')
@ObjectType()
export class Role extends CrudEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field(() => UserTypes, { nullable: true })
  defaultForType: UserTypes;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role, {
    lazy: true,
  })
  @Field(() => [UserRole], { nullable: true })
  userRoles?: UserRole[];

  @OneToMany(() => RoleFx, (roleFx) => roleFx.role, {
    cascade: true,
    lazy: true,
  })
  @Field(() => [RoleFx])
  roleFx: RoleFx[];
}
```

### RoleFx Entity
```typescript
@Entity({ name: 'sec_role_fx' })
@ObjectType()
export class RoleFx extends CrudEntity {
  @ManyToOne(() => Role, (role) => role.roleFx, { lazy: true, nullable: true })
  @Field(() => Role, { nullable: true })
  role?: Role;

  @ManyToOne(() => Functionality, (functionality) => functionality.roleFx, { lazy: true, nullable: true })
  @Field(() => Functionality, { nullable: true })
  functionality?: Functionality;

  @OneToMany(() => RoleFxUrl, (roleFxUrl) => roleFxUrl.roleFx, { nullable: true, cascade: true, lazy: true })
  @Field(() => [RoleFxUrl], { nullable: true })
  roleFxUrls?: RoleFxUrl[];
}
```
## Data Transfer Objects (DTOs)

### Input DTOs

#### CreateRoleInput
```typescript
@InputType()
export class CreateRoleInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;
}
```

#### CreateAndRemoveRoleFxInput
```typescript
@InputType()
export class CreateAndRemoveRoleFxInput {
  @Field(() => [CreateRoleFxAndUrlsInput])
  @IsArray()
  rolesFx: CreateRoleFxAndUrlsInput[];

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
```

### Event DTOs

#### ValidateRoleEventInput
```typescript
@InputType()
export class ValidateRoleEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
```

## Event System

### Event Constants
```typescript
export const validateRoleEvent = 'validateRole';
export const getOneRoleFxByEvent = 'getOneRoleFxByEvent';
```

### Event Handlers

#### onValidateRole
```typescript
@OnEvent(validateRoleEvent)
async onValidateRole({
  context,
  roleId,
  orFail
}: {
  context: IContext;
  roleId: string;
  orFail: boolean;
}): Promise<Role>
```

## Security Features

### Access Controls
- @AdminOnly() decorator for admin-only endpoints
- Role validation for operations
- Permission verification
- Secure role-functionality associations

### Validations
- Role name uniqueness
- Role existence verification
- Functionality validation
- URL security checks

## Integration Points

### Module Dependencies
- UsersModule: For user-role associations
- AuthModule: For authentication
- FunctionalitiesModule: For functionality management

### Event Integration
- validateRoleEvent
- getOneRoleFxByEvent
- functionalitiesByRoleEvent

## Error Handling

### Error Types
- BadRequestException
  - Duplicate role names
  - Invalid role data
- NotFoundException
  - Role not found
- ValidationError
  - Invalid input data

## Usage Examples

### Creating a Role
```typescript
// GraphQL Mutation
mutation {
  createRole(createRoleInput: {
    name: "Admin"
    description: "Administrator role"
  }) {
    id
    name
    description
  }
}
```

### Managing Role Functionalities
```typescript
// Replace role functionalities
mutation {
  replaceAllRolesFx(replaceAllRolesFxInput: {
    roleId: "role-uuid"
    rolesFx: [{
      permission: "security.users.create"
      urls: ["/api/users"]
    }]
  }) {
    id
    permission
    urls
  }
}
```

## Configuration

### Dependencies
- @nestjs/common
- @nestjs/graphql
- @nestjs/typeorm
- class-validator
- class-transformer

### Tools
- TypeORM for persistence
- GraphQL for API
- Event Emitter for events
- Class Validator for validations

## Best Practices

### Role Management
- Use unique role names
- Implement proper validation
- Maintain role hierarchy
- Secure role assignments

### Performance
- Lazy loading for relationships
- Efficient role queries
- Optimized functionality lookups
- Cached role data when possible

### Security
- Validate all role operations
- Secure role-functionality associations
- Protect sensitive role data
- Implement proper access controls 
