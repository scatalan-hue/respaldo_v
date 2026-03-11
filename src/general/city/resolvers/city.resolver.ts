import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { CityService } from '../services/city.service';
import { City } from '../entities/city.entity';
import { FindCitiesArgs } from '../dto/args/find-cities.arg';

@Resolver((of) => City)
export class CityResolver {
  constructor(private readonly service: CityService) {}

  @Query(() => City, { name: 'city' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('departmentId', { type: () => ID }, ParseUUIDPipe)
    departmentId: string,
    @CurrentContext() context,
  ): Promise<City> {
    return this.service.city(context, id, departmentId);
  }

  @Query(() => [City], { name: 'cities' })
  async findAll(@Args() args: FindCitiesArgs, @CurrentContext() context): Promise<City[]> {
    return this.service.cities(context, args);
  }
}
