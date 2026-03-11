[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Department Module Documentation]

# Department Module Documentation

## Module Overview

The Department module is a part of the backend system designed to manage department-related data and operations. It provides functionalities to query, create, and manage departments within an organization.

### High-level Explanation of its Structure

The module is structured into several key components:
- **Entities**: Define the data structure for departments.
- **DTOs**: Data Transfer Objects for handling input and output data.
- **Services**: Business logic and data manipulation.
- **Resolvers**: GraphQL resolvers for handling queries and mutations.
- **Constants**: Define constant values used across the module.

## Module.ts Description

The `department.module.ts` file imports necessary modules and provides the main configuration for the Department module.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentResolver } from './resolvers/department.resolver';
import { DepartmentService } from './services/department.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  providers: [DepartmentResolver, DepartmentService],
})
export class DepartmentModule {}
```

### Providers, Imports, Exports
- **Imports**: `TypeOrmModule` for database interaction with the `Department` entity.
- **Providers**: `DepartmentResolver`, `DepartmentService`.

### Dependencies with Other Modules
- Relies on `TypeOrmModule` for database operations.

## Entities

### Department Entity

The `Department` entity represents the department data structure.

```typescript
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'grl_department' })
@ObjectType()
export class Department extends CrudEntity {
  @Column()
  @Field(() => Int)
  code: number;

  @Column({ type: 'nvarchar' })
  @Field(() => String)
  name: string;

  @ManyToOne(() => Country, undefined, { lazy: true })
  @Field(() => Country, { nullable: true })
  country: Country;

  @OneToMany(() => Organization, (organizations) => organizations.department, {
    lazy: true,
  })
  organizations?: Organization[];
}
```

#### Field-by-Field Breakdown
- **code**: Integer field representing the department code.
- **name**: String field for the department name.
- **country**: Many-to-one relationship with `Country` entity.
- **organizations**: One-to-many relationship with `Organization` entity.

#### Relations and Decorators
- Uses `@Entity`, `@ObjectType`, `@Column`, `@Field`, `@ManyToOne`, `@OneToMany` decorators.

## DTOs

### FindDepartmentsArgs

The `FindDepartmentsArgs` class is used to define arguments for finding departments.

```typescript
import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByTypes } from '../../../../patterns/crud-pattern/enums/order-by-type.enum';

@ArgsType()
export class FindDepartmentsArgs {
  @Field(() => OrderByTypes, { nullable: true })
  @IsOptional()
  orderBy?: OrderByTypes;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  countryId?: string;
}
```

#### Field-by-Field Explanation
- **orderBy**: Optional field to specify order type.
- **countryId**: Optional field to filter by country ID.

#### Validation and GraphQL Decorators
- Uses `@ArgsType`, `@Field`, `@IsOptional` decorators.

## Services

### DepartmentService

The `DepartmentService` class contains business logic for department operations.

```typescript
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderByTypes } from '../../../patterns/crud-pattern/enums/order-by-type.enum';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { findDepartmentEvent } from '../constants/events.constants';
import { FindDepartmentsArgs } from '../dto/args/find-departments.arg';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async department(context: IContext, id: string, countryId?: string): Promise<Department> {
    const entity = await this.departmentRepo.findOne({
      where: {
        id,
        country: {
          id: countryId,
        },
      },
    });

    if (!entity) throw new NotFoundException(`object with id: ${id} not found`);

    return entity;
  }

  async departments(context: IContext, args: FindDepartmentsArgs): Promise<Department[]> {
    const { countryId, orderBy } = args;

    const departments = await this.departmentRepo.find({
      where: {
        country: {
          id: countryId,
        },
      },
    });

    let orderedDepartments;

    if (orderBy) {
      orderedDepartments = departments.sort((a, b) => {
        return orderBy === OrderByTypes.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    } else {
      orderedDepartments = departments;
    }

    return orderedDepartments;
  }

  @OnEvent(findDepartmentEvent)
  async onDepartment({ context, departmentId, departmentCode }: { context: IContext; departmentId?: string; departmentCode?: number }): Promise<Department> {
    if (departmentId) return await this.department(context, departmentId);
    else {
      const result = await this.departmentRepo.findOne({
        where: {
          code: departmentCode,
        },
      });

      if (!result) throw new BadRequestException(`Department ${departmentCode} is not found`);
      return result;
    }
  }
}
```

#### Public Methods
- **department**: Fetches a department by ID and optional country ID.
- **departments**: Retrieves a list of departments, optionally ordered.
- **onDepartment**: Event listener for department-related events.

#### Error Handling
- Throws `NotFoundException` and `BadRequestException` for error scenarios.

## GraphQL Resolvers

### DepartmentResolver

The `DepartmentResolver` class handles GraphQL queries for departments.

```typescript
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Department } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { FindDepartmentsArgs } from '../dto/args/find-departments.arg';

@Resolver((of) => Department)
export class DepartmentResolver {
  constructor(private readonly service: DepartmentService) {}

  @Query(() => Department, { name: 'department' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('countryId', { type: () => ID }, ParseUUIDPipe) countryId: string,
    @CurrentContext() context,
  ): Promise<Department> {
    return this.service.department(context, id, countryId);
  }

  @Query(() => [Department], { name: 'departments' })
  async findAll(@Args() args: FindDepartmentsArgs, @CurrentContext() context): Promise<Department[]> {
    return this.service.departments(context, args);
  }
}
```

#### Queries
- **findOne**: Fetches a single department by ID and country ID.
- **findAll**: Retrieves all departments based on provided arguments.

#### Example GraphQL Queries
```graphql
query GetDepartment($id: ID!, $countryId: ID!) {
  department(id: $id, countryId: $countryId) {
    code
    name
    country {
      id
    }
  }
}

query GetDepartments($orderBy: OrderByTypes, $countryId: ID) {
  departments(orderBy: $orderBy, countryId: $countryId) {
    code
    name
  }
}
```

## Events

### Constants

The `events.constants.ts` file defines event constants used in the module.

```typescript
export const findDepartmentEvent = 'findDepartmentEvent';
```

### Event Handlers
- **onDepartment**: Listens for `findDepartmentEvent` and handles department retrieval based on event data.

## Final Summary

The Department module is integral for managing department data within the system. It provides robust querying capabilities through GraphQL and handles data persistence with TypeORM. Key integration points include the use of `TypeOrmModule` for database operations and event-driven architecture for handling department-related events. Developers should be aware of the error handling mechanisms in place to ensure smooth operation. 