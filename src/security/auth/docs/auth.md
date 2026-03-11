[Home](../../../../README.md) > [System Modules Documentation](../../../docs/modules.md) > [Security Module Documentation](../../docs/security.md) > [Authentication Module Documentation]

# 🔐 Authentication Module Documentation

## 📋 Description
The Authentication module is a core security component that manages user identification, verification, and session control within the system. It implements a JWT-based authentication system with multiple strategies and integrations, providing a robust foundation for application security.

## 🏗️ Architecture

### 📦 Module Structure
```
src/security/auth/
├── controllers/      # REST endpoints for authentication
├── decorators/       # Custom security decorators
├── dto/              # Data Transfer Objects
│   ├── inputs/       # Input DTOs for operations
│   └── responses/    # Response DTOs for auth operations
├── entities/         # Database entities
├── enums/            # Enumerations for auth types
├── guards/           # JWT and role guards
├── interfaces/       # Service interfaces
├── resolvers/        # GraphQL resolvers
├── services/         # Business logic services
├── strategies/       # Passport authentication strategies
└── auth.module.ts    # Module definition
```

### 🔄 Authentication Flow
1. User provides credentials (username/password, token, etc.)
2. Authentication strategy validates credentials
3. If valid, system generates JWT token
4. Token is returned to client for subsequent requests
5. Guards validate token on protected endpoints
6. Token refresh extends session as needed

## 🛠️ Core Components

### 🚪 Authentication Strategies

#### 🔑 JwtStrategy
- Extracts and validates JWT tokens from requests
- Loads user details based on token payload
- Supports token expiration and refresh
- Implements token blacklisting for security

#### 👤 LocalStrategy
- Validates username and password credentials
- Supports password hashing and security
- Implements brute force protection
- Handles user status verification

### 🔒 Authentication Guards

#### 🛡️ JwtAuthGuard
- Protects routes requiring authentication
- Validates token presence and integrity
- Extracts user context
- Handles authentication exceptions

#### 👑 RolesGuard
- Implements role-based access control
- Validates user roles against requirements
- Supports role hierarchies
- Works with JWT guard for complete protection

### 📡 Authentication Controllers

#### 🔓 AuthController
- `/auth/login`: Authenticates users and issues tokens
- `/auth/refresh`: Refreshes expired tokens
- `/auth/user`: Returns current user information
- `/auth/logout`: Invalidates current token

### ⚡ GraphQL Resolvers

#### 🔌 AuthResolver
- `login(credentials)`: GraphQL mutation for authentication
- `refreshToken(token)`: Mutation for token refresh
- `me()`: Query for current user information
- `logout()`: Mutation for token invalidation

## 🚀 Key Features

### 🔑 JWT Authentication
The system implements JSON Web Tokens (JWT) for stateless authentication:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };
    
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
  }
}
```

### 🔄 Token Refresh Mechanism
Implements refresh tokens for extending sessions without requiring re-authentication:

```typescript
@Injectable()
export class AuthService {
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      // Get the user
      const user = await this.usersService.findOne(decoded.sub);
      
      // Generate a new access token
      const newAccessToken = await this.generateToken(user);
      
      return {
        token: newAccessToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 🔐 Security Measures
The authentication system implements multiple security measures:

- **Token Expiration**: Short-lived tokens minimize attack windows
- **CSRF Protection**: Implemented using secure cookies and tokens
- **API Rate Limiting**: Prevents brute force attacks
- **Token Blacklisting**: Invalidates compromised tokens
- **IP Tracking**: Records login attempts for security monitoring

### 🔄 External Authentication
Supports integration with external authentication systems:

- **SSO Integration**: Single Sign-On with external systems
- **OAuth Support**: Authentication via OAuth providers
- **LDAP Integration**: Corporate directory integration
- **Custom Providers**: Extensible authentication strategies

## 📝 Data Models

### 📊 AuthResponse
```typescript
@ObjectType()
export class AuthResponse {
  @Field()
  token: string;
  
  @Field(() => User)
  user: User;
  
  @Field({ nullable: true })
  refreshToken?: string;
}
```

### 📥 LoginInput
```typescript
@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;
  
  @Field()
  @MinLength(8)
  password: string;
}
```

## 🔧 Usage Examples

### ✅ Authenticating a User
```typescript
// Using the AuthService to authenticate
const authResponse = await authService.signIn({
  email: "user@example.com",
  password: "securePassword123"
});

// Using the token for API calls
const headers = {
  Authorization: `Bearer ${authResponse.token}`
};
```

### 🛡️ Protecting Routes
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  @Roles(UserRoles.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
```

### 🔄 Refreshing Tokens
```typescript
// Client-side code to refresh token
async function refreshToken(refreshToken) {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  return await response.json();
}
```

## ⚙️ Configuration

### 🔧 Environment Variables
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=15m
```

### 📝 Module Configuration
```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthResolver,
  ],
  exports: [AuthService],
})
export class AuthModule {}
```

## 🛠️ Best Practices

### 🔒 Security Recommendations
- Use HTTPS for all authentication-related endpoints
- Implement token expiration and refresh mechanisms
- Store tokens securely (HttpOnly cookies or secure storage)
- Implement rate limiting on authentication endpoints
- Log authentication events for security monitoring
- Use strong password policies and hashing
- Implement multi-factor authentication for sensitive operations

### 🚧 Common Issues
- **Token Expiration**: Implement token refresh before expiration
- **CORS Issues**: Configure proper CORS settings for authentication
- **Mobile Authentication**: Use appropriate token storage for mobile apps
- **Microservices**: Implement consistent authentication across services
- **Testing**: Use mock authentication for testing protected routes

## 📚 Related Documentation
- [User Module Documentation](../../users/docs/users.md)
- [Role Management Documentation](../../roles/role/docs/role.md)
- [API Security Documentation](../../../docs/api-security.md)

## Features
- User authentication and authorization
- JWT token management
- Security guards and decorators
- User verification and validation
- Role-based access control

## Example - User Management
- Create, edit, and delete users.
- Validate login credentials.
- Manage roles and permissions.

## Controllers / Resolvers / Producers

### Controllers

#### AuthController
- **Description**: Handles REST endpoints for authentication and token management.
- **Endpoints**:
  - **Purpose**: Generate authentication token for external API access
  - **Method**: POST
  - **Route**: /auth/getTokenAuth
  - **Parameters**: 
    - context: IContext
    - input: CreateTokenInput
  - **Return**: CreateTokenResponse
  - **Decorators and Headers**:
    - `@ApiHeader`: Adds a required `api-key` header for external authentication.
    - `@ExternalApiKey`: Custom decorator to validate the external API key.
  - **Request Example**:
  ```http
  POST /auth/getTokenAuth
  Content-Type: application/json
  api-key: your-api-key
  {
    "email": "user@example.com",
    "identificationNumber": "123456789"
  }
  ```
  - **Response Example**:
  ```json
  {
    "token": "jwt.token.here"
  }
  ```

## Services

### AuthService
- **Description**: Central authentication service that handles authentication logic and token management.
- **Key Functions**:
  - **signIn**: Authenticates a user and generates a JWT token.
    - **Parameters**: `context` (IContext), `signinInput` (SigninInput)
    - **Return**: `AuthResponse`
    - **Usage Example**:
      ```typescript
      const authResponse = await authService.signIn(context, {
        email: "user@example.com",
        password: "securePassword"
      });
      ```
  - **validateUser**: Validates a user by their ID.
    - **Parameters**: `context` (IContext), `id` (string)
    - **Return**: `User`
    - **Exceptions**: Throws `UnauthorizedException` if the user is inactive.
  - **revokeCredential**: Revokes a user's credentials.
    - **Parameters**: `context` (IContext), `revokeCredentialInput` (RevokeCredentialInput)
    - **Return**: `User[]`
    - **Usage Example**:
      ```typescript
      const users = await authService.revokeCredential(context, {
        userIds: ["userId1", "userId2"],
        credentialsExpirationDate: new Date()
      });
      ```

  - **getTokenAuth**: Generates an authentication token for a user.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `userInput` (CreateTokenInput): Input data to create the token.
      - `userIn` (User, optional): Existing user.
      - `args` (UserKeyExtraArgs, optional): Additional arguments.
      - `expirable` (boolean, optional): Indicates if the token is expirable.
    - **Return**: `string` with the generated token or `BadRequestException` if an error occurs.
    - **Usage Example**:
      ```typescript
      const token = await authService.getTokenAuth(context, userInput);
      ```

  - **sendVerificationCode**: Sends a verification code to the user.
    - **Parameters**: 
      - `type` (VerificationTypes): Verification type (Email or Phone).
      - `context` (IContext): Request context.
      - `user` (User): User to whom the code is sent.
      - `code` (string): Verification code.
    - **Process**: Emits events to log and send the verification code.

  - **signUp**: Registers a new user and sends a confirmation email.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `signupInput` (SignupEmailInput): Input data for registration.
    - **Return**: `AuthResponse` with the token and user data.
    - **Usage Example**:
      ```typescript
      const authResponse = await authService.signUp(context, signupInput);
      ```

  - **validateUserToken**: Validates a user token.
    - **Parameters**: 
      - `validateTokenInput` (ValidateTokenInput): Input data to validate the token.
    - **Return**: `User` if the token is valid.
    - **Exceptions**: 
      - `BadRequestException` if the token is invalid.

  - **approvalJwt**: Approves a JWT token with a code.
    - **Parameters**: 
      - `approvalTokenInput` (ApprovalTokenInput): Input data for approval.
    - **Return**: `AuthResponse` with the new token and user data.
    - **Exceptions**: 
      - `BadRequestException` if the code is invalid.

  - **revalidateToken**: Revalidates a user token.
    - **Parameters**: 
      - `user` (User): User for whom the token is revalidated.
    - **Return**: `AuthResponse` with the new token.

  - **sendCodeDoubleVerification**: Sends a double verification code.
    - **Parameters**: 
      - `sendDoubleVerificationInput` (SendDoubleVerificationInput): Input data for sending.
    - **Return**: `string` indicating the code was sent successfully.
    - **Exceptions**: 
      - `BadRequestException` if a sending method is not provided.

  - **signInByUser**: Signs in a user by their ID.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `userId` (string): User ID.
    - **Return**: `string` with the generated token.
    - **Exceptions**: 
      - `UnauthorizedException` if the user has no password or is inactive.

  - **validateAndGetUsers**: Validates and retrieves a list of users by their IDs.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `userIds` (string[]): List of user IDs.
    - **Return**: `User[]` list of valid users.
    - **Exceptions**: 
      - `UnauthorizedException` if a user is not found.

  - **updateUserCredentials**: Updates a user's credentials.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `user` (User): User whose credentials are updated.
      - `credentialsExpirationDate` (Date, optional): Credentials expiration date.

  - **revokeCredential**: Revokes credentials for multiple users.
    - **Parameters**: 
      - `context` (IContext): Request context.
      - `revokeCredentialInput` (RevokeCredentialInput): Input data for revocation.
    - **Return**: `User[]` list of users whose credentials were revoked.

#### AuthNotificationService
- **Description**: Service that handles authentication-related notifications, such as sending verification codes.
- **Key Methods**:
  - **signupEmail**: Sends a registration confirmation email to the user.
    - **Parameters**: `context` (IContext), `user` (User), `confirmationCode` (string)
    - **Return**: `Notification`
    - **Exceptions**: Throws `BadRequestException` if an error occurs while creating the notification.
    - **Usage Example**:
      ```typescript
      const notification = await authNotificationService.signupEmail(context, user, '123456');
      ```
  - **sendVerificationCodeToJwt**: Sends a verification code to the user via email or SMS.
    - **Parameters**: `context` (IContext), `user` (User), `code` (string), `type` (TypeNotification)
    - **Return**: `Notification`
    - **Exceptions**: Throws `BadRequestException` if an error occurs while creating the notification.
    - **Usage Example**:
      ```typescript
      const notification = await authNotificationService.sendVerificationCodeToJwt(context, user, '123456', TypeNotification.Email);
      ```

## Data Layer (Models and Data Structures)

### Entities
- **Description**: Represent database models and define the structure of stored data.

### DTOs (Data Transfer Objects)
- **Description**: Objects used to transfer data between layers while maintaining encapsulation.

### Enums (Enumerations)
- **Description**: Define a set of named constants to improve code readability and maintainability.

### Constants
- **Description**: Store fixed values used throughout the application, avoiding hard-coded values.

## 2. Complete Module Structure

```
src/security/auth/
├── constants/           # Event constants and system configurations
├── controllers/         # REST controllers for authentication endpoints
├── dto/                 # Data Transfer Objects
│   └── inputs/          # Input DTOs for authentication operations
├── decorators/          # Custom decorators for authentication functionality
├── enum/                # Enumerations for authentication types
├── guards/              # Security guards
├── interfaces/          # TypeScript interfaces
├── resolver/            # GraphQL resolvers
├── service/             # Business logic services
├── strategies/          # Authentication strategies
├── types/               # GraphQL types
├── utils/               # Utility functions
└── auth.module.ts       # Module definition
```

## 3. Key Components

### Guards

#### SecurityAuthGuard
- **Description**: Main authentication guard that validates JWT tokens and verifies user types.
- **Usage**:
  ```typescript
  @UseGuards(SecurityAuthGuard)
  ```
- **Technical Details**:
  - Extends `AuthGuard` from `@nestjs/passport` to handle JWT authentication.
  - Uses `Reflector` to obtain metadata from `@Public` and `@SecureUserTypes` decorators.
  - Allows access to public routes and verifies allowed user types.
  - Throws a `ForbiddenException` if the user type is not allowed.

#### BeforeSecurityAuthGuard
- **Description**: Guard that verifies the validity of the API key and updates the JWT token before authentication.
- **Usage**:
  ```typescript
  @UseGuards(BeforeSecurityAuthGuard)
  ```
- **Technical Details**:
  - Uses `EventEmitter2` to verify API key credentials.
  - Emits events to obtain organization and product data associated with the API key.
  - Verifies and updates the JWT token in the authorization header.
  - Throws an `UnauthorizedException` if the credentials are not valid.

#### FunctionalityGuard
- **Description**: Guard that validates access to specific functionalities based on user type.
- **Usage**:
  ```typescript
  @UseGuards(FunctionalityGuard)
  ```
- **Technical Details**:
  - Uses `Reflector` to obtain the required functionality from the `@Functionality` decorator.
  - Verifies if the user has permission to access the requested functionality.
  - Throws a `ForbiddenException` if the user does not have permission for the functionality.

### Decorators

#### CurrentUser
- **Description**: Extracts the current user from the request and verifies their type.
- **Usage**:
  ```typescript
  @CurrentUser() user: User
  ```
- **Technical Details**:
  - Uses `createParamDecorator` to access the user in the execution context.
  - Verifies if the user is valid and if they have allowed user types.
  - Throws an `InternalServerErrorException` if the user is not defined.
  - Throws a `ForbiddenException` if the user type is not allowed.

#### Functionality
- **Description**: Defines the required functionalities and applies security guards.
- **Usage**:
  ```typescript
  @Functionality(key: any)
  ```
- **Technical Details**:
  - Uses `SetMetadata` to set the required functionality.
  - Applies the `FunctionalityGuard` to verify access to the functionality.
  - Allows defining specific functionalities for resolvers and controllers.

#### OrganizationProduct
- **Description**: Interceptor that manages the association of products and organizations based on the API key.
- **Usage**:
  ```typescript
  @UseInterceptors(OrganizationProductInterceptor)
  ```
- **Technical Details**:
  - Uses `EventEmitter2` to emit events and obtain organization and product data.
  - Verifies the `api-key`, `ProductId`, and `OrganizationId` headers to associate data.
  - Adds organization and product data to the request if available.

#### Public
- **Description**: Marks endpoints as public, allowing access without authentication.
- **Usage**:
  ```typescript
  @Public()
  ```
- **Technical Details**:
  - Uses `SetMetadata` to set the `isPublic` key to `true`.
  - Allows endpoints to be accessible without authentication.

#### UserTypes
- **Description**: Defines the allowed user types to access a resource.
- **Usage**:
  ```typescript
  @SecureUserTypes(UserTypes.Admin, UserTypes.SuperAdmin)
  ```
- **Technical Details**:
  - Uses `SetMetadata` to set the allowed user types.
  - Provides specific decorators like `AnyUser`, `AdminOnly`, and `SuperAdminOnly` to facilitate access configuration.

## 4. Data Transfer Objects (DTOs)

### Input DTOs

#### ApprovalTokenInput
- **Description**: DTO for token approval with an associated code.
- **Fields**:
  - `token`: (String) Token to approve, cannot be empty.
  - `code`: (String) Code associated with the token, cannot be empty.
- **Validations**: Uses `IsNotEmpty`