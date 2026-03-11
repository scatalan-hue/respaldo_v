[Home](../../../README.md) > [System Modules Documentation](modules.md) > [Main.ts Documentation]

# 🚀 main.ts — Technical Documentation

This file is the **entry point** of the NestJS application. It configures the main aspects of the app's runtime, such as:

- Application initialization
- HTTPS setup
- WebSocket Subscriptions (GraphQL)
- Swagger (OpenAPI) documentation
- Global middleware, filters, and pipes
- Body parser configuration

---

## 📌 Function Overview

### `bootstrap()`

This is the main asynchronous function that:

1. Disables TLS certificate verification (for development).
2. Creates a NestJS app with `ExpressAdapter`.
3. Applies global filters and middleware.
4. Configures miscellaneous behavior (CORS, pipes, body size limits, logging).
5. Sets up Swagger for REST API documentation.
6. Conditionally enables HTTPS if `HTTPS=true` in the environment.
7. Configures WebSocket subscriptions for GraphQL.
8. Starts listening on the specified `APP_PORT`.

---

## 🔒 `configureHttpsServer(server)`

Sets up an HTTPS server using:

- `CERT_PFX`: Path to the PFX certificate file.
- `CERT_PASS`: Path to the passphrase file.

Reads these files from the filesystem using `fs.readFileSync`.

---

## 📡 `configureSubscriptions(app, server)`

Enables WebSocket subscriptions for GraphQL by:

- Getting the compiled GraphQL schema from `GraphQLSchemaHost`.
- Starting an `ApolloServer` instance with the schema.
- Applying GraphQL middleware at `/graphql`.
- Creating a `SubscriptionServer` from `subscriptions-transport-ws`.

Logs a message when a user connects via WebSocket.

---

## 📖 `configureSwagger(app)`

Generates and sets up **Swagger** documentation at the `/docs` endpoint using:

- The environment variable `NAME` for the title.
- Bearer Auth for protected endpoints.
- Description: `"CS3 BASE"`.

---

## 🧰 `configureMiscellaneous(app)`

Adds miscellaneous global behaviors:

- Applies the `I18nValidationPipe` globally:
  - Enables `transform`.
  - Allows implicit type conversion.
- Enables CORS.
- Sets log levels to `error` and `warn`.
- Configures `bodyParser` limits based on the `FILES_UPLOAD_LIMIT` environment variable.

---

## 🌐 Global Middlewares and Filters

- `ThrowExceptionFilter`: Global error handler for standardizing exceptions.
- `I18nMiddleware`: Parses and applies internationalization preferences per request.

---

## ✅ Environment Variables Used

```env
APP_PORT         (number)   - Port where the application will listen
HTTPS            (string)   - If 'true', enables HTTPS mode
CERT_PFX         (string)   - Path to the .pfx certificate file
CERT_PASS        (string)   - Path to the .pfx password file
FILES_UPLOAD_LIMIT (string) - Max file upload size (e.g., '10mb')
NAME             (string)   - Used for Swagger title
```

---

## 🧪 Technologies Used

- **NestJS** (core framework)
- **Apollo Server** (GraphQL API)
- **subscriptions-transport-ws** (WebSocket subscriptions)
- **Swagger / OpenAPI** (API documentation)
- **i18n** (internationalization middleware and pipe)
- **Winston/Nest logger** (logging)
- **Express** (HTTP server adapter)

---

## 📌 Summary

This `main.ts` is the core launcher for the app. It centralizes important behaviors and configurations needed to get the application up and running, including:

- Global middleware and validation
- Multi-protocol support (HTTP/HTTPS + WebSocket)
- API documentation (Swagger)
- Multi-language support (i18n)

Make sure all required environment variables are set before starting the app.

---
