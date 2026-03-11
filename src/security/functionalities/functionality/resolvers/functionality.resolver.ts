import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FunctionalityKeys as FunctionalityAllKeys } from '../../../../app.functionalities';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly, AnyUser } from '../../../auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../auth/utils/crud.utils';
import { FunctionalityDescriptionInput } from '../dto/inputs/functionality-description.input';
import { Functionality } from '../entities/functionality.entity';
import { FunctionalityService, serviceStructure } from '../services/functionality.service';
import { FunctionalityModel } from '../types/functionality.type';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: FunctionalityService,
  update: {
    name: 'updateFunctionality',
    decorators: [AdminOnly],
  },
  remove: {
    name: 'removeFunctionality',
    decorators: [AdminOnly],
  },
  findOne: { name: 'functionality', decorators: [AdminOnly] },
  findAll: { name: 'functionalities', decorators: [AdminOnly] },
});

@Resolver(() => Functionality)
export class FunctionalityResolver extends CrudResolverFrom(resolverStructure) {
  @Query(() => FunctionalityModel, { name: 'functionalitiesTree' })
  @AdminOnly()
  functionalities(): FunctionalityModel {
    return FunctionalityAllKeys;
  }

  @Query(() => Functionality, { name: 'functionalitiesByPermission' })
  @AnyUser()
  functionalitiesDescriptionByPermission(
    @Args('functionalityDescriptionInput') functionalityDescriptionInput: FunctionalityDescriptionInput,
    @CurrentContext() context: IContext,
  ): Promise<Functionality> {
    return this.service.functionalitiesDescriptionByPermission(context, functionalityDescriptionInput);
  }

  @Mutation(() => String, { name: 'synchronizeFunctionalities' })
  @AdminOnly()
  async synchronizePageBlocks(@CurrentContext() context: IContext): Promise<string> {
    return await this.service.synchronizeFunctionalities(context);
  }
}
