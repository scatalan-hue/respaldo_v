[Home](../../../README.md) > [System Modules Documentation](../../docs/modules.md) > [Security Module Documentation](../docs/security.md) > [Security Decorators Documentation]

# Decorators Documentation

## Decorator: ExternalApiKey

**Description:**
The `ExternalApiKey` decorator is used to apply the `ExternalApikeyInterceptor`. This interceptor is responsible for handling external API key validation, ensuring that requests include a valid API key before proceeding with the operation.

**Usage:**
This decorator is typically used in controllers or services where external API key validation is required. By applying this decorator, you ensure that the associated interceptor is invoked, which performs the necessary checks.

## Decorator: UserAdmin

**Description:**
The `UserAdmin` decorator applies the `UserAdminInterceptor`. This interceptor is designed to enforce administrative privileges, ensuring that only users with admin rights can access certain functionalities or endpoints.

**Usage:**
Use this decorator in scenarios where administrative access is required. It helps in securing endpoints by restricting access to users with the appropriate admin role.

## Decorator: UserStatus

**Description:**
The `UserStatus` decorator applies the `UserStatusInterceptor`. This interceptor checks the status of a user, ensuring that only users with an active status can perform certain actions or access specific resources.

**Usage:**
Apply this decorator to endpoints or services where user status validation is necessary. It helps in maintaining security by preventing inactive or unauthorized users from accessing sensitive operations. 