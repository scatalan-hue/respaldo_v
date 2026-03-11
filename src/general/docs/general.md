[Home](../../../README.md) > [System Modules Documentation](../../docs/modules.md) > [General Module Documentation]

# General Module Documentation

## **Description**

The General module is a fundamental component of the VUDEC system that provides common functionality and services used throughout the application. This module encompasses various utilities such as geographic data management, file handling, audit logging, document type handling, notification services, and template management. The General module serves as a foundation for other modules in the system, providing reusable components and services that maintain consistency across the application.

## **Module Overview**

The General module is structured with a focus on separation of concerns, with each submodule addressing a specific area of functionality:

### **Consistency & Standards**

Consistency and uniformity in the structure of a project are crucial elements for its maintenance, comprehension, and scalability. In our environment, when implementing a standard CRUD, we adopt the following nomenclature:

- Create
- Update
- Remove
- Find

However, exceptions arise, especially when dealing with an intermediate table or a many-to-many relationship. In these instances, we opt for:

- Add
- Remove

## **Submodules**

### **1. [Audit](../audit/doc/audit.md)**
Provides comprehensive auditing capabilities, tracking changes to entities and actions performed by users throughout the system. The audit module records timestamps, user information, and details of changes for security and compliance purposes.

### **2. [Base](../base/docs/base.md)**
Contains base classes and interfaces that serve as foundations for other modules, promoting code reuse and standardization across the application.

### **3. [City](../city/docs/city.md)**
Manages city data, including storage, retrieval, and relationships with departments and countries. This module is essential for location-based functionalities within the system.

### **4. [Country](../country/docs/country.md)**
Handles country information, providing services for querying and managing country data. The module integrates with other geographic modules like departments and cities to create a complete location hierarchy.

### **5. [Department](../department/docs/department.md)**
Manages department/state/province data, forming the middle tier of the geographic hierarchy between countries and cities.

### **6. [DocumentType](../documentType/docs/documentType.md)**
Provides functionality for managing different types of identification documents used across the system, such as national IDs, passports, and other official documents.

### **7. [Documents](../documents/document/docs/document.md)**
Handles document management, allowing for the storage, retrieval, and manipulation of various document types in the system.

### **8. [Dummy](../dummy/docs/dummy.md)**
Contains placeholder implementations for testing and development purposes.

### **9. [Files](../files/docs/files.md)**
Provides comprehensive file management capabilities, including upload, storage, retrieval, and manipulation of files. This module supports multiple storage backends and handles various file types.

### **10. [Notifications](../notifications/notification/docs/notification.md)**
Manages the creation, delivery, and tracking of notifications across the system, supporting multiple notification channels such as email, in-app notifications, and more.

### **11. [Schedule](../schedule/docs/schedule.md)**
Handles scheduling of tasks and jobs, allowing for timed execution of operations throughout the application.

### **12. [Server](../server/README.md)**
Provides server-related utilities and configurations used across the application.

### **13. [Subscriptions](../suscriptions/docs/suscriptions.md)**
Manages subscription-based functionalities, including event registration, listener management, and notification delivery.

### **14. [Template](../template/docs/template.md)**
Provides template management for various system components, supporting customization of emails, documents, and other content.

## **Key Features**

- **Geographic Data Management**: Comprehensive handling of countries, departments, and cities
- **File Management**: Robust file storage, retrieval, and manipulation
- **Audit Logging**: Detailed tracking of system changes and user actions
- **Document Processing**: Management of document types and document data
- **Notification Services**: Multi-channel notification delivery system
- **Template Handling**: Customizable templates for various system outputs
- **Scheduled Tasks**: Time-based job execution for system maintenance and operations

## **Module Structure**

The General module follows a consistent structure across its submodules:

```
src/general/
├── audit/              # Audit tracking and logging
├── base/               # Base classes and interfaces
├── city/               # City data management
├── country/            # Country data management
├── department/         # Department/state data management
├── documentType/       # Document type definitions
├── documents/          # Document management
├── dummy/              # Test implementations
├── files/              # File management system
├── notifications/      # Notification system
├── schedule/           # Task scheduling
├── server/             # Server utilities
├── subscriptions/      # Subscription management
├── template/           # Template system
├── docs/               # Module documentation
└── general.module.ts   # Module definition
```

## **Implementation Details**

### **Entities**

The General module contains various entities that represent the data models used across the system. These entities are designed with TypeORM and GraphQL integration in mind, providing both database storage and API exposure.

### **Services**

Each submodule provides services that encapsulate the business logic related to their domain. These services follow the dependency injection pattern and are available to other modules that import the General module.

### **Resolvers**

GraphQL resolvers are provided for relevant submodules, allowing for API access to the functionality. These resolvers use the underlying services to perform operations and return results.

### **Controllers**

REST controllers are available for certain submodules, particularly those that handle file operations or other functionality that is more suited to REST than GraphQL.

### **DTOs**

Data Transfer Objects are used throughout the module to define the structure of input and output data for API operations, ensuring type safety and validation.

## **Usage Examples**

### **Geographic Data**

```typescript
// Retrieving a list of countries
const countries = await countryService.countries(context, { orderBy: OrderByTypes.ASC });

// Getting city information
const city = await cityService.city(context, cityId);
```

### **File Management**

```typescript
// Uploading a file
const file = await filesService.upload(context, {
  base64: fileBase64,
  fileName: 'document.pdf'
});

// Retrieving a file
const fileData = await filesService.getFileById(context, fileId);
```

### **Audit Logging**

```typescript
// Creating an audit entry
await auditService.createAudit(context, {
  entityId: entityId,
  entityType: EntityType.USER,
  action: ActionType.UPDATE,
  details: { previousState, newState }
});
```

## **Integration with Other Modules**

The General module provides foundational services used by other modules in the system:

- **Security Module**: Uses audit services for tracking security events
- **Main Module**: Utilizes geographic data, file management, and notifications
- **External API Module**: Leverages template and file services for integration points

## **Best Practices**

When working with the General module, consider the following best practices:

1. **Use Existing Services**: Leverage the provided services rather than reimplementing functionality
2. **Follow Naming Conventions**: Adhere to the CRUD naming conventions (Create, Update, Remove, Find) for consistency
3. **Proper Error Handling**: Handle exceptions thrown by services appropriately
4. **Context Propagation**: Always pass the context object to service methods for proper tracking and security
5. **Validation**: Use the provided DTOs and their validation decorators to ensure data integrity

## **Conclusion**

The General module serves as a critical foundation for the VUDEC system, providing essential services and utilities that are used throughout the application. By maintaining a consistent structure and following established patterns, the module ensures code reusability, maintainability, and scalability across the system.