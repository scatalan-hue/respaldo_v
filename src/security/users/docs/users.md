[Home](../../../../README.md) > [System Modules Documentation](../../../docs/modules.md) > [Security Module Documentation](../../docs/security.md) > [Users Module Documentation]

# 👥 Users Module Documentation

## 📋 Overview
The Users module is a core component of the security system that manages all user-related functionality, authentication, and permission management.

## 🏗️ Architecture

### 📦 Module Structure
```
src/security/users/
├── constants/        # Module constants and event definitions
├── controllers/      # REST endpoints for user management
├── dto/              # Data Transfer Objects
│   ├── inputs/       # Input DTOs for user operations
│   └── responses/    # Response DTOs for user operations
├── entities/         # User-related entities
├── enums/            # User-related enumerations
├── events/           # Event handlers
├── interfaces/       # Service interfaces
├── resolvers/        # GraphQL resolvers
├── services/         # User management services
├── types/            # GraphQL types
└── users.module.ts   # Module definition
```

### 🔄 User Management Flow
1. User creation/registration 
2. Profile management and updates
3. Status and permission management
4. User authentication integration
5. Role assignment and verification

## 🧑‍💼 User Types and States

### 👤 User Types
- **Super Admin**: Full system access with all privileges
- **Administrator**: Management access with high permissions
- **Standard User**: Regular access with limited permissions
- **External User**: Limited access for external integrations

### 🚦 User States
- **Active**: User has full access according to permissions
- **Inactive**: User account exists but cannot login
- **Locked**: User account is temporarily suspended
- **Pending**: User registration is pending approval

## 🛠️ Core Components

### 💼 User Services

#### 👤 UsersService
Main service for user management operations:

```typescript
@Injectable()
export class UsersService {
  constructor(
    private entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(context: IContext, createUserInput: CreateUserInput): Promise<User> {
    // User creation logic
  }

  async findAll(context: IContext): Promise<User[]> {
    // User query logic
  }

  async findOne(context: IContext, id: string): Promise<User> {
    // Single user retrieval
  }

  async update(context: IContext, id: string, updateUserInput: UpdateUserInput): Promise<User> {
    // User update logic
  }

  async remove(context: IContext, id: string): Promise<User> {
    // User removal logic
  }
}
```

Key operations:
- 🆕 **User Creation**
- 🔍 **User Retrieval**
- 🔄 **Profile Updates**
- 🔐 **Password Management**
- 🚫 **Account Deactivation**

### 📡 User Controllers

#### 👥 UsersController
REST endpoints for user management:

- `GET /users`: Retrieve all users
- `GET /users/:id`: Get user by ID
- `POST /users`: Create a new user
- `PUT /users/:id`: Update a user
- `DELETE /users/:id`: Delete a user

### ⚡ GraphQL Resolvers

#### 👤 UsersResolver
GraphQL API for user operations:

```typescript
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async users(@Context() context: IContext): Promise<User[]> {
    return this.usersService.findAll(context);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async createUser(
    @Context() context: IContext,
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser(context, createUserInput);
  }
}
```

## 📊 Data Models

### 👤 User Entity
```typescript
@Entity('sec_user')
@ObjectType()
export class User extends CrudEntity {
  @Column()
  @Field()
  @Index({ unique: true })
  email: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  lastName: string;

  @Column()
  password: string;

  @Column()
  @Field(() => UserStatus)
  status: UserStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.user, {
    lazy: true,
  })
  @Field(() => [UserRole], { nullable: true })
  userRoles?: UserRole[];
}
```

### 📥 User DTOs
```typescript
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field()
  @IsString()
  @MinLength(2)
  lastName: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  roleId?: string;
}
```

## 🔐 Security Features

### 🔒 Password Management
- Secure password hashing with bcrypt
- Password complexity validation
- Controlled password reset flow
- Password history tracking (optional)

### 👮 Access Control
- Integration with role-based access control
- Status-based access restrictions
- Permission validation on operations
- Audit trail for user operations

### 🔍 User Validation
```typescript
async validateUser(email: string, password: string): Promise<User> {
  const user = await this.findByEmail(email);
  
  if (!user) {
    throw new NotFoundException('User not found');
  }
  
  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedException('User is not active');
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  return user;
}
```

## 🔄 Integration Points

### 🔑 Auth Module
- Provides authentication integration
- Supplies user context for operations
- Handles credential validation

### 🛡️ Roles Module
- Manages role assignments
- Provides permission control
- Handles role validation

### 📝 Audit Module
- Records user operations
- Tracks user changes
- Provides accountability

## 🔧 Usage Examples

### ✅ Creating a New User
```typescript
// Service approach
const newUser = await usersService.createUser(context, {
  email: "user@example.com",
  name: "John",
  lastName: "Doe",
  password: "securePassword123",
  roleId: "role-uuid-here"
});

// GraphQL mutation
mutation {
  createUser(createUserInput: {
    email: "user@example.com",
    name: "John",
    lastName: "Doe",
    password: "securePassword123",
    roleId: "role-uuid-here"
  }) {
    id
    email
    name
    lastName
    status
  }
}
```

### 🔍 Finding Users
```typescript
// Finding all users
const users = await usersService.findAll(context);

// Finding by ID
const user = await usersService.findOne(context, "user-id-here");

// Finding by email
const user = await usersService.findByEmail(context, "user@example.com");
```

### 🔄 Updating a User
```typescript
// Updating user profile
const updatedUser = await usersService.update(context, userId, {
  name: "New Name",
  lastName: "New Last Name"
});

// Changing user password
await usersService.changePassword(context, userId, {
  currentPassword: "oldPassword",
  newPassword: "newSecurePassword"
});
```

## ⚙️ Configuration

### 🔧 Environment Variables
```env
PASSWORD_SALT_ROUNDS=10
USER_LOGIN_ATTEMPTS_LIMIT=5
USER_LOCKOUT_DURATION=15m
```

### 📝 Module Configuration
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    forwardRef(() => AuthModule),
    forwardRef(() => RolesModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersResolver,
    UserProfileService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

## 🚀 Best Practices

### 🔒 Security Recommendations
- Always hash passwords before storage
- Validate email addresses with confirmation
- Implement proper access control
- Log sensitive user operations
- Use context-based validation for operations

### 🚫 Common Pitfalls
- Exposing sensitive user data
- Missing proper validation
- Insecure password practices
- Lack of proper error handling
- Insufficient access control

## Complete Module Structure
```
src/security/users/
├── constants/           # Event constants and other constant values
├── controllers/         # REST endpoints controllers
├── docs/               # Module documentation
├── dto/                # Data Transfer Objects
│   ├── args/          # Query arguments
│   ├── events/        # Event payloads
│   ├── inputs/        # Input types for mutations/operations
│   └── models/        # Response models
├── entities/           # Database entities and views
├── enums/             # Enumerations (UserTypes, StatusTypes, etc.)
├── report/            # Report generation logic
├── resolvers/         # GraphQL resolvers
├── scalars/           # Custom GraphQL scalars
├── services/          # Business logic services
└── users.module.ts    # Module definition
```

### Key Components

#### Services
- `UsersService`: Core user management operations
- `UserViewService`: Optimized user queries and reports
- `UsersNotificationService`: Email and notification handling
- `UsersTokenService`: Token management for authentication

#### GraphQL Components
- `UsersResolver`: Main user operations resolver
- `UserViewResolver`: Optimized queries resolver
- Custom scalars for specialized data types

#### REST Components
- `UserController`: REST endpoints for user operations
- Report generation and file downloads

#### Data Layer
- `User` entity: Core user data structure
- `UserView` entity: Optimized read model
- `UserToken` entity: Authentication token storage

## Module Structure

### Main Module (`users.module.ts`)
```typescript
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken, UserView]), AuthModule],
  providers: [UsersResolver, UsersService, UsersNotificationService, UsersTokenService, UserViewService, UserViewResolver],
  exports: [UsersService, UserViewService],
  controllers: [UserController],
})
```

## Core Services

### UsersService
Main service that handles user operations.

#### Key Methods

1. **User Management**

##### createUserAuth0
```typescript
async createUserAuth0(context: IContext, user: CreateUserAuth0Input): Promise<User>
```
- **Purpose**: Creates a new user from Auth0 authentication
- **Input Payload**: 
  ```typescript
  class CreateUserAuth0Input {
    email: string;        // Required, must be valid email
    name: string;         // Required
    lastName: string;     // Required
    identificationType: UserDocumentTypes;    // Required
    identificationNumber: string;             // Required
    password: string;     // Required, must meet password requirements
  }
  ```
- **Validations**:
  - Email must be unique in the system
  - Email must be in valid format
  - Password must meet complexity requirements
- **Conditions**:
  - Sets user type as UserTypes.User
  - Password is hashed before storage
- **Returns**: Created User entity
- **Throws**:
  - BadRequestException if email already exists
  - ValidationError if input is invalid

##### updateUserAuth0
```typescript
async updateUserAuth0(context: IContext, user: UpdateStatusUserAuth0): Promise<User>
```
- **Purpose**: Updates user status and information from Auth0
- **Input Payload**:
  ```typescript
  class UpdateStatusUserAuth0 {
    id: string;          // Required, UUID
    password: string;    // Required
    identificationType: UserDocumentTypes;    // Required
    identificationNumber: string;             // Required
  }
  ```
- **Validations**:
  - User must exist
  - Valid UUID for id
- **Conditions**:
  - Updates password (hashed)
  - Sets status to UserStatusTypes.Active
  - Sets type to UserTypes.User
- **Returns**: Updated User entity
- **Throws**: NotFoundException if user not found

##### resetSuperAdmin
```typescript
async resetSuperAdmin(context: IContext): Promise<User>
```
- **Purpose**: Creates or resets the super admin user
- **Conditions**:
  - Uses email from configuration (configService.sa.email)
  - Creates new user if doesn't exist
  - Updates password if user exists
  - Always sets type as UserTypes.SuperAdmin
  - Sets status as UserStatusTypes.Active
- **Security**: Only accessible by system processes
- **Returns**: SuperAdmin User entity

##### findOneByEmail
```typescript
async findOneByEmail(context: IContext, email: string, orFail?: boolean): Promise<User>
```
- **Purpose**: Retrieves user by email address
- **Parameters**:
  - email: string (required) - Email to search
  - orFail: boolean (optional) - Throws if user not found
- **Validations**: Email format validation
- **Returns**: User entity or null
- **Throws**: NotFoundException if orFail=true and user not found

##### updateUserInformation
```typescript
async updateUserInformation(context: IContext, input: UpdateUserInformationInput): Promise<User>
```
- **Purpose**: Updates basic user information
- **Input Payload**:
  ```typescript
  class UpdateUserInformationInput {
    name?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    cityId?: string;
    departmentId?: string;
    countryId?: string;
  }
  ```
- **Validations**:
  - User must exist
  - City, department, country IDs must be valid if provided
  - Phone number format validation
- **Conditions**:
  - Only updates provided fields
  - Maintains existing data for non-provided fields
  - Updates fullName if name/lastName change
- **Returns**: Updated User entity
- **Events Emitted**: UserUpdatedEvent
- **Throws**:
  - NotFoundException if user not found
  - ValidationError for invalid inputs

##### validateAndRetrieveUserByToken
```typescript
async validateAndRetrieveUserByToken(
  context: IContext, 
  password: string, 
  passwordConfirm: string, 
  token: string
): Promise<User>
```
- **Purpose**: Validates recovery token and retrieves user
- **Parameters**:
  - password: New password
  - passwordConfirm: Password confirmation
  - token: JWT recovery token
- **Validations**:
  - Token must be valid and not expired
  - Passwords must match
  - Password complexity requirements
- **Security**:
  - Uses JWT_SECRET for token verification
  - Token expiration check
- **Returns**: User entity if token valid
- **Throws**:
  - ForbiddenException for invalid/expired token
  - BadRequestException for password mismatch

2. **Event Handlers**

##### onFindUserById
```typescript
@OnEvent(findUserByIdEvent)
async onFindUserById({
  context,
  id,
  relations,
  orFail = true
}: FindUserByIdEventInput): Promise<User>
```
- **Purpose**: Event handler for user lookup by ID
- **Input Payload**:
  ```typescript
  interface FindUserByIdEventInput {
    context: IContext;
    id: string;        // UUID
    relations?: FindOptionsRelationByString;
    orFail?: boolean;  // Default true
  }
  ```
- **Conditions**:
  - Loads specified relations if provided
  - Can optionally fail if user not found
- **Returns**: User entity with requested relations
- **Throws**: NotFoundException if orFail=true and user not found

### UserViewService
Service for optimized user queries and reports.

#### Key Methods

##### usersView
```typescript
async usersView(context: IContext, args?: FindUserViewArgs): Promise<UserView[]>
```
- **Purpose**: Retrieves filtered list of users with optimized view
- **Input Args**:
  ```typescript
  class FindUserViewArgs {
    skip?: number;
    take?: number;
    where?: UserViewWhereInput;
    order?: UserViewOrderInput;
  }
  ```
- **Permissions**: Requires AnyUser decorator
- **Conditions**:
  - Applies organization context filters
  - Handles pagination
  - Applies custom where clauses
- **Returns**: Array of UserView entities
- **Performance**: Uses materialized view for better query performance

## GraphQL Resolvers

### UsersResolver
Main resolver for user operations.

#### Mutations

1. **User Management**
```graphql
mutation resetSuperAdmin
mutation updatePassword(updatePasswordInput: UpdatePasswordInput!)
mutation updateUserInformation(updateUserInformationInput: UpdateUserInformationInput!)
mutation updateUserPassword(updateUserPasswordInput: UpdateUserPasswordInput!)
mutation recoveryPassword(recoveryPasswordInput: RecoveryPasswordInput!)
mutation sendEmailRecoveryPassword(sendEmailRecoveryPasswordInput: SendEmailRecoveryPasswordInput!)
```

##### resetSuperAdmin
```graphql
mutation {
  resetSuperAdmin
}
```
- **Purpose**: Resets or creates the super admin user
- **Access**: Public endpoint
- **Returns**: User object
- **Side Effects**: 
  - Creates super admin if doesn't exist
  - Resets password if exists
- **Security**: Should be disabled in production

##### updatePassword
```graphql
mutation updatePassword($input: UpdatePasswordInput!) {
  updatePassword(updatePasswordInput: $input) {
    id
    email
  }
}
```
- **Input**:
  ```typescript
  class UpdatePasswordInput {
    @Field()
    @IsNotEmpty()
    token: string;      // Recovery token

    @Field()
    @IsNotEmpty()
    @MinLength(8)
    password: string;   // New password

    @Field()
    @IsNotEmpty()
    passwordConfirm: string;
  }
  ```
- **Validations**:
  - Token must be valid and not expired
  - Password must meet complexity requirements
  - Passwords must match
- **Access**: Public endpoint
- **Returns**: Updated User object
- **Throws**:
  - BadRequestException for invalid token
  - ValidationError for password mismatch

##### updateUserInformation
```graphql
mutation updateUserInformation($input: UpdateUserInformationInput!) {
  updateUserInformation(updateUserInformationInput: $input) {
    id
    name
    lastName
    fullName
    email
  }
}
```
- **Input**:
  ```typescript
  class UpdateUserInformationInput {
    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => String, { nullable: true })
    lastName?: string;

    @Field(() => String, { nullable: true })
    phoneNumber?: string;

    @Field(() => String, { nullable: true })
    address?: string;

    @Field(() => ID, { nullable: true })
    cityId?: string;
  }
  ```
- **Access**: @AnyUser decorator
- **Validations**:
  - At least one field must be provided
  - Valid city ID if provided
- **Returns**: Updated User object
- **Events**: Emits UserUpdatedEvent

##### recoveryPassword
```graphql
mutation recoveryPassword($input: RecoveryPasswordInput!) {
  recoveryPassword(recoveryPasswordInput: $input) {
    id
    email
  }
}
```
- **Input**:
  ```typescript
  class RecoveryPasswordInput {
    @Field()
    @IsNotEmpty()
    token: string;

    @Field()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @Field()
    @IsNotEmpty()
    passwordConfirm: string;
  }
  ```
- **Access**: Public endpoint
- **Process**:
  1. Validates recovery token
  2. Checks password requirements
  3. Updates password
  4. Invalidates all active sessions
- **Returns**: Updated User object
- **Security**:
  - Rate limited
  - Token expiration check
  - Password history validation

##### sendEmailRecoveryPassword
```typescript
async sendEmailRecoveryPassword(
  context: IContext, 
  passwordRecoveryInput: SendEmailRecoveryPasswordInput
): Promise<{ expCode: number }>
```
- **Purpose**: Initiates password recovery process by sending email
- **Input Payload**:
  ```typescript
  class SendEmailRecoveryPasswordInput {
    @Field()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }
  ```
- **Process**:
  1. Validates user exists and can recover password
  2. Generates 5-digit recovery code
  3. Sets 5-minute expiration time
  4. Registers code in user-key system
  5. Sends recovery email
- **Security**:
  - Not available for Public or SuperAdmin users
  - Code expires in 5 minutes
  - Uses secure random code generation
- **Events Emitted**:
  - `registerCodeEvent`: Stores recovery code
  - `recoverPasswordEmailEvent`: Triggers email sending
- **Returns**: Object with expiration timestamp
- **Throws**:
  - NotFoundException if user not found
  - BadRequestException if user type invalid

##### updatePassword
```typescript
async updatePassword(
  context: IContext, 
  updatePasswordInput: UpdatePasswordInput
): Promise<User>
```
- **Purpose**: Updates user password using recovery token
- **Input Payload**:
  ```typescript
  class UpdatePasswordInput {
    @Field()
    @IsNotEmpty()
    token: string;

    @Field()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @Field()
    @IsNotEmpty()
    passwordConfirm: string;
  }
  ```
- **Validations**:
  - Token must be valid JWT
  - Passwords must match
  - Password complexity requirements
- **Process**:
  1. Validates token authenticity
  2. Extracts user ID from token
  3. Verifies user exists
  4. Hashes new password
  5. Updates user record
- **Security**:
  - Uses JWT with configurable secret
  - Password hashing with bcrypt
- **Returns**: Updated User entity
- **Throws**:
  - ForbiddenException for invalid token
  - BadRequestException for password mismatch
  - NotFoundException if user not found

##### updateUserPassword
```typescript
async updateUserPassword(
  context: IContext, 
  updateUserPasswordInput: UpdateUserPasswordInput
): Promise<User>
```
- **Purpose**: Changes user password with current password verification
- **Input Payload**:
  ```typescript
  class UpdateUserPasswordInput {
    @Field()
    @IsNotEmpty()
    currentPassword: string;

    @Field()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;

    @Field()
    @IsNotEmpty()
    newPasswordConfirm: string;
  }
  ```
- **Validations**:
  - Current password must match
  - New passwords must match
  - Password complexity requirements
- **Security**:
  - Requires current password verification
  - Uses bcrypt for password comparison
  - Password hashing for new password
- **Returns**: Updated User entity
- **Throws**:
  - BadRequestException for invalid current password
  - BadRequestException for password mismatch
  - NotFoundException if user not found

##### codeRecoverPassword
```typescript
async codeRecoverPassword(
  context: IContext, 
  codeRecoverPasswordInput: CodeRecoverPasswordInput
): Promise<string>
```
- **Purpose**: Validates recovery code and generates JWT token
- **Input Payload**:
  ```typescript
  class CodeRecoverPasswordInput {
    @Field()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Field()
    @IsNotEmpty()
    code: string;
  }
  ```
- **Process**:
  1. Verifies user exists
  2. Validates recovery code
  3. Generates JWT token
- **Events**:
  - `checkCodeEvent`: Validates code validity and expiration
- **Security**:
  - Code must be valid and not expired
  - Limited attempts tracking
  - JWT token generation
- **Returns**: JWT token for password reset
- **Throws**:
  - BadRequestException for invalid code
  - NotFoundException if user not found

#### Queries

##### codeRecoverPassword
```graphql
query codeRecoverPassword($input: CodeRecoverPasswordInput!) {
  codeRecoverPassword(codeRecoverPasswordInput: $input)
}
```
- **Input**:
  ```typescript
  class CodeRecoverPasswordInput {
    @Field()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Field()
    @IsNotEmpty()
    code: string;
  }
  ```
- **Access**: Public endpoint
- **Process**:
  1. Validates recovery code
  2. Generates recovery token
- **Returns**: JWT token string
- **Security**:
  - Rate limited
  - Code expiration check
  - Failed attempts tracking

#### Resolve Fields

##### roles
```graphql
{
  user {
    roles {
      id
      name
      key
    }
  }
}
```
- **Purpose**: Resolves user's assigned roles
- **Access**: Inherited from parent resolver
- **Returns**: Array of Role entities
- **Performance**: Uses DataLoader for batch loading

##### permissions
```graphql
{
  user {
    permissions {
      functionality {
        key
        name
      }
      urls
    }
  }
}
```
- **Purpose**: Resolves user's effective permissions
- **Returns**: Array of RoleFxAndUrlsResponse
- **Process**:
  1. Aggregates permissions from all roles
  2. Resolves URLs for each functionality
  3. Removes duplicates
- **Performance**: Cached per request

##### fullName
```graphql
{
  user {
    fullName
  }
}
```
- **Purpose**: Computes user's full name
- **Returns**: String
- **Logic**: Concatenates name + middleName + lastName + secondSurname

##### organizations
```graphql
{
  user {
    organizations {
      id
      name
      type
    }
  }
}
```
- **Purpose**: Resolves organizations user belongs to
- **Returns**: Array of Organization entities
- **Performance**: Uses DataLoader for batch loading

### UserViewResolver
Resolver for optimized user queries.

#### Queries

##### usersView
```graphql
query usersView($skip: Int, $take: Int, $where: UserViewWhereInput, $order: UserViewOrderInput) {
  usersView(skip: $skip, take: $take, where: $where, order: $order) {
    id
    fullName
    email
    status
  }
}
```
- **Purpose**: Optimized user listing with filtering and pagination
- **Access**: @AnyUser decorator
- **Input Args**:
  ```typescript
  class UserViewWhereInput {
    @Field(() => String, { nullable: true })
    search?: string;  // Searches name, email, identification

    @Field(() => [String], { nullable: true })
    status?: UserStatusTypes[];

    @Field(() => [String], { nullable: true })
    types?: UserTypes[];
  }
  ```
- **Returns**: Array of UserView entities
- **Performance**:
  - Uses materialized view
  - Implements cursor-based pagination
  - Optimized search indexes

##### usersViewCount
```graphql
query usersViewCount($where: UserViewWhereInput) {
  usersViewCount(where: $where) {
    total
    filtered
  }
}
```
- **Purpose**: Gets total and filtered count of users
- **Access**: @AnyUser decorator
- **Returns**: MetadataPagination object
- **Performance**: Uses count optimization techniques

## Data Transfer Objects (DTOs)

### Input DTOs

1. **CreateUserInput**
   - Required: `name`, `lastName`, `email`, `identificationNumber`
   - Optional: `middleName`, `secondSurname`, `password`, `rolesId`
   - Validation: Email format, string lengths, document types

2. **UpdateUserInput**
   - Partial update of user data
   - Status validation
   - Role updates

3. **RecoveryPasswordInput**
   - Recovery token
   - New password and confirmation

4. **Other Important DTOs**
   - `UpdateUserPasswordInput`: Password change
   - `UpdateUserInformationInput`: Basic info update
   - `SendEmailRecoveryPasswordInput`: Recovery request
   - `CodeRecoverPasswordInput`: Code verification

### Event DTOs

#### FindUserByIdEventInput
```typescript
@InputType()
export class FindUserByIdEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  id: string;
}
```

#### UpdateUserEventInput
```typescript
@InputType()
export class UpdateUserEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => UpdateUserInput)
  @IsNotEmpty()
  input: UpdateUserInput;
}
```

## Security Features

### Password Management
- Bcrypt hashing
- Temporary password support
- Recovery flow
- Two-step verification

### Status Management
```typescript
enum UserStatusTypes {
  Active = 'active',
  Inactive = 'inactive',
  InactiveDefinitively = 'inactiveDefinitively',
  InactiveByAttempts = 'inactiveByAttempts',
  InactiveTemporary = 'inactiveTemporary'
}
```

### User Types
```typescript
enum UserTypes {
  User = 'user',
  Admin = 'admin',
  SuperAdmin = 'superAdmin',
  Public = 'public'
}
```

## Integration Points

### Auth0 Integration
- User creation
- Status synchronization
- Profile updates

### Organization Integration
- User-organization relationships
- Organization-specific permissions
- Multi-organization support

## Error Handling

### Common Errors
- Duplicate email
- Invalid credentials
- Expired tokens
- Permission denied

### Validation Errors
- Invalid email format
- Password requirements
- Required fields
- Document type validation

## Performance Considerations

### Optimized Queries
- User view entity
- Materialized views
- Selective relation loading

### Caching Strategies
- Role caching
- Permission caching
- Organization caching

## Usage Examples

### User Creation
```graphql
mutation {
  createUser(createUserInput: {
    name: "John"
    lastName: "Doe"
    email: "john@example.com"
    password: "securePassword123"
    type: User
  }) {
    id
    email
    fullName
  }
}
```

### Password Recovery
```graphql
mutation {
  sendEmailRecoveryPassword(
    sendEmailRecoveryPasswordInput: {
      email: "user@example.com"
    }
  ) {
    expCode
  }
}
```

## Configuration

### Environment Variables

#### Required Variables
- `JWT_SECRET`: Secret key for JWT token generation and validation
- `TZ`: Timezone configuration for date handling (used in password recovery expiration)
- `APP_URL`: Base URL of the application
- `APP_PORT`: Port where the application runs
- `STATE`: Application state ('dev' or 'prod')

### Security Settings
- Password complexity rules
- Token expiration times
- Login attempt limits
- Session duration

### Notification Service

#### Key Methods

##### recoverPasswordEmail
```typescript
async recoverPasswordEmail(
  context: IContext,
  user: User,
  code: string,
  expCode: string
): Promise<Notification>
```
- **Purpose**: Sends password recovery email with instructions
- **Parameters**:
  - user: Target user entity
  - code: Recovery code
  - expCode: Expiration timestamp
- **Process**:
  1. Loads organization and profile data
  2. Prepares email template variables
  3. Creates notification record
  4. Sends email through notification system
- **Template Variables**:
  - Organization logo, name, contact info
  - User full name
  - Recovery code
  - Recovery link with expiration
- **Security**:
  - Uses organization-specific email templates
  - Secure recovery link generation
- **Returns**: Created Notification entity
- **Throws**: BadRequestException if notification creation fails

##### temporalPassword
```typescript
async temporalPassword(
  context: IContext,
  user: User,
  code: string
): Promise<Notification>
```
- **Purpose**: Sends temporary password to new users
- **Parameters**:
  - user: Target user entity
  - code: Temporary password
- **Process**:
  1. Loads organization data
  2. Prepares email template
  3. Creates notification
  4. Sends temporary password email
- **Security**:
  - Organization-specific branding
  - Secure delivery system
- **Returns**: Created Notification entity
- **Throws**: BadRequestException with i18n error message

## REST Controllers

### UserController
Main controller for REST endpoints related to user operations.

#### Endpoints

##### Generate Users Report
```typescript
@Post('user/reportUsers')
@ApiOperation({ summary: 'Download Excel file' })
@ApiHeader({
  name: 'organization-id',
  required: true,
  description: 'Organization ID'
})
@AnyUser()
async report(
  @CurrentContext() context: IContext, 
  @Body() findUserViewArgs: FindUserViewArgs, 
  @Res() res: Response
)
```
- **Purpose**: Generates and downloads Excel report of users
- **Method**: POST
- **Path**: `/user/reportUsers`
- **Security**:
  - Requires authentication (@UseGuards(SecurityAuthGuard))
  - Requires @AnyUser role
  - Requires organization-id header
- **Input Body**:
  ```typescript
  class FindUserViewArgs {
    skip?: number;
    take?: number;
    where?: UserViewWhereInput;
    order?: UserViewOrderInput;
  }
  ```
- **Response**: 
  - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - File download response
- **Process**:
  1. Validates user permissions
  2. Applies filters from FindUserViewArgs
  3. Generates Excel report
  4. Streams file to client
- **Error Handling**:
  - 401 if unauthorized
  - 403 if forbidden
  - 400 if invalid input
  - 500 if report generation fails