import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { Country } from '../entities/country.entity';
import { CountryService } from '../services/country.service';
import { FindCountriesArgs } from '../dto/args/find-countries.arg';

@Resolver((of) => Country)
export class CountryResolver {
  constructor(private readonly service: CountryService) {}

  @Query(() => Country, { name: 'country' })
  async findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string, @CurrentContext() context): Promise<Country> {
    return this.service.country(context, id);
  }

  @Query(() => [Country], { name: 'countries' })
  async findAll(@Args() args: FindCountriesArgs, @CurrentContext() context): Promise<Country[]> {
    return this.service.countries(context, args);
  }
}
