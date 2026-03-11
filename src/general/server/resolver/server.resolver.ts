import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Server } from '../entities/server.entity';
import { CrudResolverStructure } from '../../../security/auth/utils/crud.utils';
import { ServerService, serviceStructure } from '../service/server.service';
import { AdminOnly } from '../../../security/auth/decorators/user-types.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ServerService,
  create: { name: 'createServer', decorators: [AdminOnly] },
  update: { name: 'updateServer', decorators: [AdminOnly] },
  remove: { name: 'removeServer', decorators: [AdminOnly] },
  findOne: { name: 'server', decorators: [AdminOnly] },
  findAll: { name: 'servers', decorators: [AdminOnly] },
});

@Resolver(() => Server)
export class ServerResolver extends CrudResolverFrom(resolverStructure) {}
