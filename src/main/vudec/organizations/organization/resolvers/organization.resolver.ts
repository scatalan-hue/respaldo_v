import { Args, ArgsType, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { CurrentContext } from '../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { Product } from '../../../product/entities/products.entity';
import { FindOrganizationArgs } from '../dto/args/find-organization.args';
import { Organization } from '../entity/organization.entity';
import { OrganizationService, serviceStructure } from '../services/organization.service';
import { Transactional } from '../../../../../patterns/crud-pattern/decorators/transactional.decorator';
import { CreateOrganizationInput } from '../dto/inputs/create-organization.input';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: OrganizationService,
  create: { name: 'createOrganization', decorators: [AnyUser, Transactional] },
  update: { name: 'updateOrganization', decorators: [AnyUser] },
  findOne: { name: 'organization', decorators: [AnyUser] },
  findAll: { name: 'organizations', decorators: [AnyUser] },
  findArgsType: FindOrganizationArgs,
});

@Resolver(() => Organization)
export class OrganizationResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => [Product], { name: 'products' })
  products(@Parent() organization: Organization, @CurrentContext() context: IContext): Promise<Product[]> {
    return this.service.organizationProducts(context, organization);
  }

  // @AnyUser()
  // // @Transactional()
  // @Mutation(() => Organization, { name: 'createOrganization' })
  // async createOrganization(
  //   @CurrentContext() context: IContext,
  //   @Args({ name: 'createInput', type: () => CreateOrganizationInput, nullable: false }) createInput: CreateOrganizationInput,
  // ): Promise<Organization> {
  //   try {
  //     return await this.service.create(context, createInput);
  //   } catch (error) {
  //     return error;
  //   }
  // }
}
