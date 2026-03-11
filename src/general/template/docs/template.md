[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Template Module Documentation]

# **Module: Template**

## **Description**

The Template module is a core component of the VUDEC system, designed to manage templates that are associated with files. This module provides comprehensive functionality for creating, updating, and managing templates, ensuring seamless integration with the file management system.

## **Features**

### **Template Management**
* Create, update, and delete templates
* Associate templates with files
* Utilize CRUD operations for template management

## **DTOs (Data Transfer Objects)**

### **CreateTemplateInput**
Located in `dto/inputs/create-template.input.ts`

#### Description
Data Transfer Object for creating a new template, including title, description, and associated file ID.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Title of the template |
| description | string | No | Description of the template |
| fileId | string | Yes | UUID of the associated file |

### **UpdateTemplateInput**
Located in `dto/inputs/update-template.input.ts`

#### Description
Data Transfer Object for updating an existing template, extending the CreateTemplateInput with an ID field.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier of the template |

## **Entities**

### **Template**
Located in `entities/template.entity.ts`

#### Description
Entity representing a template, including its title, description, and associated file.

#### Fields
| Field | Type | Description |
|-------|------|-------------|
| title | string | Title of the template |
| description | string | Description of the template |
| file | FileInfo | Associated file information |

## **Resolvers**

### **TemplateResolver**
Located in `resolvers/template.resolver.ts`

#### Description
GraphQL resolver for handling template-related operations, including creation, update, deletion, and retrieval.

#### Operations
- **createTemplate**: Creates a new template (Admin only)
- **updateTemplate**: Updates an existing template (Admin only)
- **removeTemplate**: Deletes a template (Admin only)
- **template**: Retrieves a specific template (Public)
- **templates**: Retrieves all templates (Public)

## **Services**

### **TemplateService**
Located in `services/template.service.ts`

#### Core Methods

##### beforeCreate
```typescript
async beforeCreate(context: IContext, repository: Repository<Template>, entity: Template, createInput: CreateTemplateInput): Promise<void>
```
- **Description:** Prepares the template entity before creation, ensuring the associated file is correctly linked.

## **Module**

### **TemplateModule**
Located in `template.module.ts`

#### Description
Module that encapsulates all components related to template management, including services, resolvers, and entities.

#### Providers
- TemplateResolver
- TemplateService

#### Integration
- Integrates with the file management system to associate templates with files. 