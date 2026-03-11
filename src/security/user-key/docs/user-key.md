[Home](../../../../README.md) > [System Modules Documentation](../../../docs/modules.md) > [Security Module Documentation](../../docs/security.md) > [User Key Module Documentation]

# 🔑 User Key Module Documentation

## 📋 Overview
The User Key module is a critical security component that manages authentication and authorization based on codes and tokens. This module is essential for implementing secure authentication flows, password recovery, and identity verification in the application.

### 🎯 Main Purpose
- Authentication code management
- Recovery token handling
- Identity verification
- Code-based authentication
- Code expiration management

### 🔐 System Importance
- Centralizes code-based authentication logic
- Provides secure verification mechanisms
- Integrates with event system for asynchronous operations
- Maintains security of sensitive operations

## 📂 Complete Module Structure
```
src/security/user-key/
├── constants/           # Module constants
│   ├── events.constants.ts      # Event definitions
│   └── homologation.constants.ts # Homologation constants
├── dto/                # Data Transfer Objects
│   ├── args/          # Query arguments
│   └── inputs/        # Mutation inputs
├── entities/          # Database entities
├── resolvers/         # GraphQL resolvers
├── services/          # Business services
├── types/            # GraphQL types
└── user-key.module.ts # Module definition
```

## 🧩 Key Components

### 🛠️ Services
- **🔐 UsersKeyService**: Main service for key and code management
  - Handles code creation and validation
  - Manages code-based authentication
  - Processes code-related events

### 📡 Resolvers
- **🔌 UserKeyResolver**: GraphQL resolver for key operations
  - Exposes authentication endpoints
  - Handles related queries and mutations

### 📊 Entities
- **🔑 UserKey**: Main entity for key storage
  - Stores codes and their metadata
  - Manages user relationships

## ⚙️ Core Features

### 👤 UsersKeyService

#### 📝 registerCode
```typescript
async registerCode(
  context: IContext, 
  code: string, 
  user: User, 
  origin: string, 
  credentialId?: string, 
  dateExpiration?: Date
): Promise<boolean>
```
- **📝 Purpose**: Registers an authentication code for a user
- **📥 Parameters**:
  - `context`: Operation context
  - `code`: Code to register
  - `user`: Associated user
  - `origin`: Code origin
  - `credentialId`: Optional credential ID
  - `dateExpiration`: Optional expiration date
- **🔄 Process**:
  1. Validates previous record existence
  2. Creates or updates record
  3. Sets expiration
- **📤 Returns**: boolean indicating success
- **✅ Validations**:
  - User must exist
  - Code must not be expired

#### 🔍 checkCode
```typescript
async checkCode(
  context: IContext, 
  code: string, 
  user: User, 
  origin: string
): Promise<boolean>
```
- **📝 Purpose**: Verifies code validity
- **📥 Parameters**:
  - `context`: Operation context
  - `code`: Code to verify
  - `user`: Associated user
  - `origin`: Code origin
- **🔄 Process**:
  1. Searches for code record
  2. Verifies expiration
  3. Validates user association
- **📤 Returns**: boolean indicating validity
- **✅ Validations**:
  - Code must exist
  - Must not be expired
  - Must correspond to user

#### 🔐 authByCode
```typescript
async authByCode(context: IContext, code: string): Promise<AuthResultToken>
```
- **📝 Purpose**: Authenticates user via code
- **📥 Parameters**:
  - `context`: Operation context
  - `code`: Authentication code
- **🔄 Process**:
  1. Validates code
  2. Verifies expiration
  3. Generates JWT token
  4. Returns credentials
- **📤 Returns**: AuthResultToken with authentication info
- **❌ Throws**:
  - BadRequestException if invalid code
  - BadRequestException if code expired

## 🗃️ Database Schema

### 🔑 UserKey Entity
```typescript
@Entity({ name: 'sec_user_key' })
@ObjectType()
export class UserKey extends CrudEntity {
  @Column()
  @Field(() => String)
  code: string;

  @Column({ nullable: true })
  @Field(() => Date)
  expirationCode: Date;

  @Column()
  @Field(() => String)
  origin: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  credentialId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  organizationId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  productId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  taxpayerId: string;

  @ManyToOne(() => User, (user) => user.userKeys, {
    lazy: true,
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  user: User;
}
```
- **📊 Table**: sec_user_key
- **🔗 Relationships**:
  - ManyToOne with User
- **✨ Features**:
  - Lazy loading
  - Optional metadata fields
  - Code expiration

## 📝 Data Transfer Objects (DTOs)

### 📥 Input DTOs

#### 🆕 CreateUserKeyInput
```typescript
@InputType()
export class CreateUserKeyInput {}
```
- **📝 Purpose**: Input for key creation
- **🔄 Usage**: Base for CRUD operations

#### 🔄 UpdateUserKeyInput
```typescript
@InputType()
export class UpdateUserKeyInput extends PartialType(CreateUserKeyInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;
}
```
- **📝 Purpose**: Input for key updates
- **✅ Validations**:
  - ID must be valid UUID
  - ID is required

### 📊 Args DTOs

#### 🔍 UserKeyExtraArgs
```typescript
@InputType()
export class UserKeyExtraArgs {
  @Field(() => String, { nullable: true })
  credentialId?: string;

  @Field(() => String, { nullable: true })
  organizationId?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => String, { nullable: true })
  taxpayerId?: string;
}
```
- **📝 Purpose**: Additional arguments for key operations
- **🔄 Usage**: Authentication metadata

## 📢 Event System

### 🔑 Event Constants
```typescript
export const registerCodeEvent = 'registerCode';
export const checkCodeEvent = 'checkCode';
export const createCodeEvent = 'createCode';
```

### 🔄 Event Handlers

#### 📝 onRegisterCode
```typescript
@OnEvent(registerCodeEvent)
async onRegisterCode({
  context,
  code,
  user,
  origin,
  credentialId,
  dateExp,
}: {
  context: IContext;
  code: string;
  user: User;
  origin: string;
  credentialId?: string;
  dateExp?: Date;
}): Promise<boolean>
```
- **📝 Purpose**: Handles code registration
- **🔄 Process**:
  1. Receives event
  2. Validates data
  3. Registers code
  4. Returns result

#### 🔍 onCheckCode
```typescript
@OnEvent(checkCodeEvent)
async onCheckCode({
  context,
  code,
  user,
  origin,
}: {
  context: IContext;
  code: string;
  user: User;
  origin: string;
}): Promise<boolean>
```
- **📝 Purpose**: Handles code verification
- **🔄 Process**:
  1. Receives event
  2. Validates code
  3. Returns result

## 🔐 Security Features

### 🛡️ Security Validations
- Code expiration verification
- Code origin validation
- Secure user association
- Reuse protection

### 🔒 Access Controls
- @Public() decorator for public endpoints
- Context validation
- Permission verification

### 🛑 Protections
- One-time use codes
- Automatic expiration
- Origin validation
- Input sanitization

## 🔄 Integration Points

### 🧩 Integrated Modules
- 👥 Users Module: For user validation
- 🔐 Auth Module: For token generation
- 📢 Event System: For asynchronous operations

### 📡 Shared Events
- signInWithUserEvent
- registerCodeEvent
- checkCodeEvent
- createCodeEvent

## ⚠️ Error Handling

### ❌ Error Types
- BadRequestException
  - Invalid code
  - Expired code
  - User not found
- ValidationError
  - Invalid inputs
  - Malformed UUIDs

### 🔴 Exception Handling
```typescript
if (!getRecord) 
  throw new BadRequestException(
    sendResponse(context, this.I18N_SPACE, 'authByCode.getRecord')
  );
```

## 📋 Usage Examples

### 📝 Code Registration
```typescript
// Direct
await userKeyService.registerCode(
  context,
  '123456',
  user,
  'recovery'
);

// Event-based
await eventEmitter.emit(registerCodeEvent, {
  context,
  code: '123456',
  user,
  origin: 'recovery'
});
```

### 🔍 Code Verification
```typescript
// Direct
const isValid = await userKeyService.checkCode(
  context,
  '123456',
  user,
  'recovery'
);

// Event-based
const isValid = await eventEmitter.emitAsync(checkCodeEvent, {
  context,
  code: '123456',
  user,
  origin: 'recovery'
});
```

## ⚙️ Configuration

### 🔧 Environment Variables
- `TZ`: Timezone for code expiration

### 📚 Dependencies
- @nestjs/common
- @nestjs/graphql
- @nestjs/typeorm
- bcrypt
- moment-timezone

### 🛠️ Tools
- TypeORM for persistence
- GraphQL for API
- Event Emitter for events
- Class Validator for validations

## 🔧 Troubleshooting

### 🚨 Common Issues

1. **⏱️ Expired Codes**
   - Check timezone
   - Review expiration configuration
   - Validate date formats

2. **❌ Failed Validation**
   - Verify code format
   - Check user association
   - Validate code origin

3. **🔄 Unprocessed Events**
   - Verify event registration
   - Review payloads
   - Validate handlers

### 🛠️ Solutions

1. **⏱️ For Expired Codes**
   ```typescript
   // Adjust expiration time
   const dateExp = moment.tz(process.env.TZ)
     .add(1, 'hour')
     .format('YYYY-MM-DDTHH:mm:ss');
   ```

2. **🔍 For Validation**
   ```typescript
   // Verify code
   const isValid = await checkCode(
     context,
     code,
     user,
     origin
   );
   ```

3. **📢 For Events**
   ```typescript
   // Verify emission
   await eventEmitter.emitAsync(
     registerCodeEvent,
     {
       context,
       code,
       user,
       origin
     }
   );
   ```
