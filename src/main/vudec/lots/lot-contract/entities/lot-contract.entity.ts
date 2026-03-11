import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../../../patterns/crud-pattern/entities/crud-entity';
import { Contract } from '../../../contracts/contract/entity/contract.entity';
import { Lot } from '../../lot/entity/lot.entity';

@Entity('vudec_lot_contract')
@ObjectType()
export class LotContract extends CrudEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => Lot, (lot) => lot.lotContracts, {
    lazy: true,
    nullable: false,
  })
  @Field(() => Lot, { nullable: true })
  lot?: Lot;

  @ManyToOne(() => Contract, (contract) => contract.lotContracts, {
    lazy: true,
    nullable: false,
  })
  @Field(() => Contract, { nullable: true })
  contract?: Contract;
}
