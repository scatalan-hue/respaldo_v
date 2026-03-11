import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../security/auth/utils/crud.utils';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleService, serviceStructure } from '../services/schedule.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ScheduleService,
  create: { name: 'createSchedule', decorators: [AnyUser] },
  update: { name: 'updateSchedule', decorators: [AnyUser] },
  remove: { name: 'removeSchedule', decorators: [AnyUser] },
  findOne: { name: 'schedule', decorators: [AnyUser] },
  findAll: { name: 'schedules', decorators: [AnyUser] },
});

@Resolver((of) => Schedule)
export class ScheduleResolver extends CrudResolverFrom(resolverStructure) {}
