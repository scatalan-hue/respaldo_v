[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Country Module Documentation]

# Country Module Documentation

## Module Overview

### What the module is for
The `Country` module is part of the VUDEC system and is responsible for managing information related to countries. It provides functionalities to query and sort countries, integrating with other system components.

### High-level explanation of its structure
The module is composed of entities, services, resolvers, and DTOs that allow interaction with the database and data exposure through GraphQL.

## module.ts Description

### Providers, imports, exports
The `country.module.ts` file imports the `TypeOrmModule` for the `Country` entity and provides the `CountryResolver` and `CountryService`.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CountryResolver } from './resolvers/country.resolver';
import { CountryService } from './services/country.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountryResolver, CountryService],
})
export class CountryModule {}
```

### Dependencies with other modules
This module depends on `TypeOrmModule` for managing the `Country` entity.

## Entities

### Field-by-field breakdown
The `Country` entity represents a country in the database.

```typescript
@Entity({ name: 'grl_country' })
@ObjectType()
export class Country extends CrudEntity {
  @Column()
  @Field(() => Int)
  code: number;

  @Column()
  @Field(() => String)
  name: string;

  @OneToMany(() => User, (user) => user.country, { lazy: true })
  user: User[];
}
```

### Relations and decorators
- `@Entity`: Defines the class as a TypeORM entity.
- `@ObjectType`: Marks the class as a GraphQL object type.
- `@OneToMany`: One-to-many relationship with the `User` entity.

### Inheritance
Inherits from `CrudEntity`, providing basic CRUD functionalities.

## DTOs

### Models
The `find-countries.arg.ts` file defines the arguments for querying countries.

```typescript
@ArgsType()
export class FindCountriesArgs {
  @Field(() => OrderByTypes, { nullable: true })
  @IsOptional()
  orderBy?: OrderByTypes;
}
```

### Validation decorators
- `@IsOptional`: Indicates that the field is optional.

### GraphQL decorators
- `@ArgsType`: Defines the class as a GraphQL argument type.
- `@Field`: Marks the field as a GraphQL field.

### Example payloads for GraphQL
```graphql
query {
  countries(orderBy: ASC) {
    code
    name
  }
}
```

## Services

### All public methods
The `CountryService` handles the business logic for countries.

#### country
```typescript
async country(context: IContext, id: string): Promise<Country>
```
- **Description:** Searches for a country by its ID.
- **Returns:** `Promise<Country>`

#### countries
```typescript
async countries(context: IContext, args: FindCountriesArgs): Promise<Country[]>
```
- **Description:** Returns a list of countries, optionally sorted.
- **Returns:** `Promise<Country[]>`

### Usage examples in code
```typescript
const countries = await countryService.countries(context, { orderBy: OrderByTypes.ASC });
```

### Event emitters or listeners
- `@OnEvent(countryEvent)`: Handles events related to countries.

### Error handling
Uses exceptions like `NotFoundException` and `BadRequestException` to handle errors.

## GraphQL Resolvers

### Queries and mutations
The `CountryResolver` exposes GraphQL queries for countries.

#### findOne
```typescript
@Query(() => Country, { name: 'country' })
async findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string, @CurrentContext() context): Promise<Country>
```
- **Description:** Searches for a country by its ID.

#### findAll
```typescript
@Query(() => [Country], { name: 'countries' })
async findAll(@Args() args: FindCountriesArgs, @CurrentContext() context): Promise<Country[]>
```
- **Description:** Returns a list of countries.

### Example GraphQL queries
```graphql
query {
  country(id: "1") {
    code
    name
  }
}
```

## Final Summary
The `Country` module is essential for managing country information within the VUDEC system. It provides functionalities to query and sort countries, integrating with other system components. It is important for developers to understand how to interact with the services and resolvers to fully leverage their capabilities. Ensure to properly handle exceptions and use validation and GraphQL decorators to guarantee data integrity. 