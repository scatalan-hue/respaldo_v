import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderByTypes } from '../../../patterns/crud-pattern/enums/order-by-type.enum';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { findCityEvent } from '../../../security/auth/constants/events.constants';
import { FindCitiesArgs } from '../dto/args/find-cities.arg';
import { City } from '../entities/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async city(context: IContext, id: string, departmentId?: string): Promise<City> {
    const entity = await this.cityRepo.findOne({
      where: {
        id,
        department: {
          id: departmentId,
        },
      },
    });

    if (!entity) throw new NotFoundException(`object with id: ${id} not found`);

    return entity;
  }

  async cities(context: IContext, args: FindCitiesArgs): Promise<City[]> {
    const { departmentId, orderBy } = args;

    const cities = await this.cityRepo.find({
      where: {
        department: {
          id: departmentId,
        },
      },
    });

    let orderedCities;

    if (orderBy) {
      orderedCities = cities.sort((a, b) => {
        return orderBy === OrderByTypes.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    } else {
      orderedCities = cities;
    }

    return orderedCities;
  }

  @OnEvent(findCityEvent)
  async onCountry({
    context,
    cityId,
    departmentCode,
    cityCode,
  }: {
    context: IContext;
    cityId?: string;
    departmentCode?: number;
    cityCode?: number;
  }): Promise<City> {
    if (cityId) return await this.city(context, cityId);
    else {
      const result = await this.cityRepo.findOne({
        where: {
          code: cityCode,
          department: {
            code: departmentCode,
          },
        },
      });

      if (!result) throw new BadRequestException(`City ${departmentCode}-${cityCode} is not found`);
      return result;
    }
  }
}
