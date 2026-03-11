import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { Country } from '../entities/country.entity';
import { countryDefaultEvent, countryEvent } from '../../../security/auth/constants/events.constants';
import { OnEvent } from '@nestjs/event-emitter';
import { FindCountriesArgs } from '../dto/args/find-countries.arg';
import { OrderByTypes } from '../../../patterns/crud-pattern/enums/order-by-type.enum';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  async country(context: IContext, id: string): Promise<Country> {
    const entity = await this.countryRepo.findOne({
      where: {
        id,
      },
    });

    if (!entity) throw new NotFoundException(`object with id: ${id} not found`);

    return entity;
  }

  async countries(context: IContext, args: FindCountriesArgs): Promise<Country[]> {
    const countries = await this.countryRepo.find();

    const { orderBy } = args;

    let orderedCountries;

    if (orderBy) {
      orderedCountries = countries.sort((a, b) => {
        return orderBy === OrderByTypes.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    } else {
      orderedCountries = countries;
    }

    return orderedCountries;
  }

  @OnEvent(countryEvent)
  async onCountry({ context, countryId, countryCode }: { context: IContext; countryId?: string; countryCode?: number }): Promise<Country> {
    if (countryId) return await this.country(context, countryId);
    else {
      const result = await this.countryRepo.findOne({
        where: {
          code: countryCode,
        },
      });

      if (!result) throw new BadRequestException(`Country ${countryCode} is not found`);
      return result;
    }
  }

  @OnEvent(countryDefaultEvent)
  async onCountryDefault({ context }: { context: IContext }): Promise<Country> {
    const result = await this.countryRepo.findOne({
      where: {
        code: 170,
      },
    });

    if (!result) throw new BadRequestException(`Country ${170} is not found`);
    return result;
  }
}
