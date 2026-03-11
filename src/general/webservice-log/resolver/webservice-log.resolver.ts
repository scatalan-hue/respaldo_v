import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { WebserviceLogService, serviceStructure } from '../services/webservice-log.service';
import { WebserviceLog } from '../entities/webservice-log.entity';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { FindWebserviceLogArgs } from '../dto/args/webservice-log.args';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: WebserviceLogService,
  findOne: { name: 'webserviceLog', decorators: [AnyUser] },
  findAll: { name: 'webserviceLogs', decorators: [AnyUser] },
  findArgsType: FindWebserviceLogArgs,
});

@Resolver(() => WebserviceLog)
export class WebserviceLogResolver extends CrudResolverFrom(resolverStructure) {}
