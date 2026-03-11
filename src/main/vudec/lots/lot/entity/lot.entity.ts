import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Movement } from '../../../movement/entity/movement.entity';
import { LotContract } from '../../lot-contract/entities/lot-contract.entity';
import { LotType } from '../enum/lot-type.enum';
import { OrganizationProduct } from '../../../organizations/organization-product/entities/organization-product.entity';

@Entity('vudec_lot')
@ObjectType()
export class Lot extends CrudEntity {
  @Column({ nullable: false })
  @Field(() => String, { nullable: false })
  consecutive: string;

  @Column({ nullable: false })
  @Field(() => String, { nullable: false })
  name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  internalId?: string;

  @Column({ nullable: true })
  @Field(() => LotType, { nullable: true })
  lotType: LotType;

  @ManyToOne(() => OrganizationProduct, (organizationProduct) => organizationProduct.lots, {
    lazy: true,
    nullable: false,
  })
  @Field(() => OrganizationProduct, { nullable: false })
  organizationProduct?: OrganizationProduct;

  @OneToMany(() => LotContract, (lotContract) => lotContract.lot, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [LotContract], { nullable: true })
  lotContracts?: LotContract[];

  @OneToMany(() => Movement, (movement) => movement.lot, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Movement], { nullable: true })
  movements?: Movement[];
}
