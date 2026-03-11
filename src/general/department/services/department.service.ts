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
