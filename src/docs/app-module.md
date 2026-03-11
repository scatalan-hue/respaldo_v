[Home](../../../README.md) > [System Modules Documentation](modules.md) > [App Module Documentation]

# 📦 AppModule — Technical Documentation

The `AppModule` is the **root module** of the project developed with **NestJS**. This module orchestrates the global configuration of the application, including:

- Environment variables.
- GraphQL configuration.
- SQL and MongoDB database connections.
- Internationalization (i18n).
- Logging with Winston.
- Functional system modules.
- Global interceptors and pipes.

---

## 📂 General Structure

```ts
@Module({
  imports: [...],
  controllers: [AppController],
  providers: [...]
})
export class AppModule { }
```

---

## 🧩 Imported Modules

### 🔧 `ConfigModule`

Configures and validates **environment variables** using `Joi`. Loaded globally (`isGlobal: true`) to be available throughout the application.

- Validates required variables like port, DB credentials, JWT, and superadmin credentials.
- Loads from the `config.ts` file.

### 📊 `GraphQLModule`

GraphQL configuration with Apollo:

- Driver: `ApolloDriver`.
- Disables playground (`playground: false`) in favor of the default landing page.
- Automatically generates schema (`autoSchemaFile`).
- Uses a custom scalar for passwords: `ValidatePassword`.
- Customizes error formatting using `formatError`.

### 🛢️ `TypeOrmModule`

Configures SQL Server database connection:

- Injects `configService` to use environment variables.
- Automatically loads entities.
- Enables `logging`.
- Uses `schema: 'dbo'`.

### 🍃 `MongooseModule` (conditional)

If `DB_MONGODB_SERVER` and `DB_MONGODB_NAME` variables are set, a MongoDB connection is configured.

### 🌐 `I18nModule`

Internationalization (i18n) support:

- Default language: `es`.
- Uses multiple resolvers to detect language:
  - `QueryResolver` with `lang`
  - `AcceptLanguageResolver`
  - `HeaderResolver` with header `x-lang`
- Loads translation files from `/common/i18n/`.

### 📢 `EventEmitterModule`

Enables a custom **Event Bus** for application-level events.

### 📑 `WinstonModule`

Configures the global logger using `Winston`:

- Level: `info`.
- Console output with improved format and timestamp.

### 🔒 Functional Modules

- `SecurityModule`: Handles security (auth, users, permissions).
- `MainModule`: Main business logic.
- `GeneralModule`: General/shared functionality.
- `PatternsModule`: Business patterns or rules.
- `ExternalApiModule`: Integrations with external APIs.

---

## 🎮 Controllers

### `AppController`

Main controller, typically used for health checks or global endpoints.

---

## ⚙️ Global Providers

### 🧱 Filters

- `APP_FILTER → ThrowExceptionFilter`: Global filter to handle and standardize exceptions.

### 🧹 Interceptors

- `APP_INTERCEPTOR → LanguageInterceptor`: Detects and applies language globally.
- `APP_INTERCEPTOR → TrimAndRenameInterceptor`: Cleans underscores and normalizes fields.
- `APP_INTERCEPTOR → OrganizationProductInterceptor`: Validates organization and product from token or header.

> ⚠️ NestJS only allows **one global interceptor** per token. If multiple interceptors use the same token (`APP_INTERCEPTOR`), they are applied in **reverse order** (last one is executed first).

### 🧪 Pipes

- `APP_PIPE → I18nValidation`: Pipe for DTO validation with internationalized messages.

### 🧮 Custom Scalars

- `DateTimeScalar`: Scalar to handle dates in GraphQL.

---

## 🧾 Environment Variable Validation

```env
STATE                  (string)   - Environment (dev, prod, etc)
APP_PORT               (number)   - Application port

HTTPS                 (string?)   - (optional) Enable HTTPS
HTTPS_PFX_PATH        (string?)   - Path to .pfx file
HTTPS_PFX_PASS        (string?)   - Password for .pfx

FILES_UPLOAD_LIMIT     (string)   - Upload file size limit

DB_TYPE                (string)   - DB type (e.g. mssql)
DB_HOST                (string)   - DB host
DB_PORT                (number)   - DB port
DB_USERNAME            (string)   - DB user
DB_PASSWORD            (string)   - DB password
DB_NAME                (string)   - DB name

DB_FILE_MODE           (string)   - File mode

DB_MONGODB_SERVER      (string?)  - (optional) MongoDB server
DB_MONGODB_NAME        (string?)  - (optional) MongoDB name

JWT_SECRET             (string)   - JWT secret
JWT_EXPIRES_IN         (string)   - JWT expiration time

SA_EMAIL               (string)   - Superadmin email
SA_PASSWORD            (string)   - Superadmin password
```

---

## 📌 Final Considerations

- This module is ready for production and development.
- Supports multiple databases (SQL Server and MongoDB).
- Internationalized and supports multi-language environments.
- Centralized error handling with advanced logging.

---
