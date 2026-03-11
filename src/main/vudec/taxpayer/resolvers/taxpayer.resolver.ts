import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { Transactional } from '../../../../patterns/crud-pattern/decorators/transactional.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { FindTaxpayerArgs } from '../dto/args/find-taxpayer.args';
import { Taxpayer } from '../entity/taxpayer.entity';
import { serviceStructure, TaxpayerService } from '../services/taxpayer.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TaxpayerService,
  findOne: { name: 'taxpayer', decorators: [Public] },
  findAll: { name: 'taxpayers', decorators: [Public] },
  update: { name: 'updateTaxpayer', decorators: [Public, Transactional] },
  findArgsType: FindTaxpayerArgs,
});

@Resolver(() => Taxpayer)
export class TaxpayerResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => String, { name: 'fullName' })
  async fullName(@Parent() taxpayer: Taxpayer, @CurrentContext() context: IContext): Promise<string> {
    return (await taxpayer?.lastName)
      ? `${(taxpayer.name || '').trim()} ${(taxpayer.middleName || '').trim()} ${(taxpayer.lastName || '').trim()} ${(taxpayer.secondSurname || '').trim()}`
          .replace(/\s+/g, ' ')
          .trim()
      : (taxpayer?.name || '').trim();
  }
}
