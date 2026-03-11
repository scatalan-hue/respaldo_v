[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [City Module Documentation]

# **Module: City**

## **Description**

The City module is a crucial component of the application that manages all information related to cities. This module provides comprehensive functionality for city management, including querying city data, managing associations with departments, users, and organizations, and handling city-related events. It is designed to integrate seamlessly with other system components, ensuring data consistency and efficient data access patterns.

## **Features**

### **City Management**
* Query city information by ID and department
* List all cities with optional ordering
* Manage city associations with departments, users, and organizations
* Handle city-related events

## **Entities**

### **City Entity**

- **Table Name:** grl_city
- **Inherits:** CrudEntity

#### **Fields**
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| code | number | No | Unique city code | Int |
| name | string | No | Name of the city | String |
| department | Department | Yes | Associated department | Department |
| user | User[] | Yes | Users associated with the city | [User] |
| organizations | Organization[] | Yes | Organizations in the city | [Organization] |

#### **Relationships**
- **Department**: Many-to-One relationship with `Department`
- **User**: One-to-Many relationship with `User`
- **Organization**: One-to-Many relationship with `Organization`

## **DTOs (Data Transfer Objects)**

### **FindCitiesArgs**

#### **Description**
Data Transfer Object for querying cities. This DTO defines the structure for filtering and ordering city data.

#### **Fields**
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| orderBy | OrderByTypes | No | Order type for city listing | IsOptional |
| departmentId | string | No | Filter cities by department ID | IsOptional |

#### **Example Payload**
```graphql
{
  orderBy: ASC,
  departmentId: "dept-123"
}
```

## **Services**

### **CityService**

#### **Core Methods**

##### **city**
```typescript
async city(context: IContext, id: string, departmentId?: string): Promise<City>
```
- **Description:** Retrieves a city by its ID and department. Throws `NotFoundException` if not found.
- **Parameters:**
  - `context`: IContext object containing request context
  - `id`: ID of the city
  - `departmentId`: Optional department ID
- **Returns:** Promise<City> - Returns the found city

##### **cities**
```typescript
async cities(context: IContext, args: FindCitiesArgs): Promise<City[]>
```
- **Description:** Retrieves all cities, optionally ordered by name.
- **Parameters:**
  - `context`: IContext object
  - `args`: FindCitiesArgs with filtering and ordering options
- **Returns:** Promise<City[]> - Returns a list of cities

#### **Event Handlers**

##### **onCountry**
```typescript
@OnEvent(findCityEvent)
async onCountry({ context, cityId, departmentCode, cityCode }: { context: IContext; cityId?: string; departmentCode?: number; cityCode?: number }): Promise<City>
```
- **Description:** Event handler for city-related events, fetching city by ID or code.
- **Parameters:**
  - `context`: IContext object
  - `cityId`: Optional city ID
  - `departmentCode`: Department code
  - `cityCode`: City code
- **Returns:** Promise<City> - Returns the found city

## **GraphQL Resolvers**

### **CityResolver**

#### **GraphQL Operations**

##### **Queries**

###### **city**
```graphql
query City($id: ID!, $departmentId: ID!) {
  city(id: $id, departmentId: $departmentId) {
    code
    name
    department {
      id
      name
    }
  }
}
```
- **Description:** Retrieves a specific city by ID and department, including basic information and associated department.
- **Parameters:**
  - `id`: ID of the city to retrieve
  - `departmentId`: ID of the department
- **Returns:** Promise<City> - Returns the found city

###### **cities**
```graphql
query Cities($orderBy: OrderByTypes, $departmentId: ID) {
  cities(orderBy: $orderBy, departmentId: $departmentId) {
    code
    name
  }
}
```
- **Description:** Retrieves a list of cities with optional ordering and filtering by department.
- **Parameters:**
  - `orderBy`: Order type
  - `departmentId`: Optional department ID
- **Returns:** Promise<[City]> - Returns a list of cities

## **Final Summary**

The City module is essential for managing city data and its associations within the application. It provides robust querying capabilities through GraphQL and ensures data integrity with TypeORM. Key integration points include its relationships with departments, users, and organizations. Developers should be aware of the entity relationships and the optional filtering capabilities provided by the service and resolver methods. 