import { Resolver } from '@nestjs/graphql';
import { ProductService, serviceStructure } from '../services/product.service';
import { AdminOnly } from '../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Product } from '../entities/products.entity';
import { Public } from '../../../../security/auth/decorators/public.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductService,
  create: { name: 'createProduct', decorators: [AdminOnly] },
  update: { name: 'updateProduct', decorators: [AdminOnly] },
  remove: { name: 'removeProduct', decorators: [AdminOnly] },
  findOne: { name: 'product', decorators: [Public] },
  findAll: { name: 'products', decorators: [Public] },
});

@Resolver(() => Product)
export class ProductResolver extends CrudResolverFrom(resolverStructure) {}
