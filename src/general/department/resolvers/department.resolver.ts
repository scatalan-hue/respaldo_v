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
