import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { OrganizationProduct } from '../../../organizations/organization-product/entities/organization-product.entity';
import { Taxpayer } from '../../../taxpayer/entity/taxpayer.entity';
import { Contract } from '../../contract/entity/contract.entity';
import { TypeMovement } from 'src/main/vudec/movement/enums/movement-type.enum';

@Entity('vudec_contract_history')
@ObjectType()
export class ContractHistory extends CrudEntity {
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  consecutive: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  contractType: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  @Field(() => Number, { nullable: true })
  contractValue: number;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDate: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDateIni: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDateEnd: Date;

  @Column({ nullable: false, default: TypeMovement.Register })
  @Field(() => TypeMovement, { nullable: false })
  type: TypeMovement;

  @Column({ name: 'organizationProductId', nullable: false })
  organizationProductId: string;

  @ManyToOne(() => OrganizationProduct, (organizationProduct) => organizationProduct.contracts, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'organizationProductId' })
  @Field(() => OrganizationProduct, { nullable: false })
  organizationProduct?: OrganizationProduct;

  @Column({ name: 'taxpayerId', nullable: false })
  taxpayerId: string;

  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.contracts, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'taxpayerId' })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;

  @Column({ name: 'contractId', nullable: false })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.history, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'contractId' })
  @Field(() => Contract, { nullable: false })
  contract?: Contract;

}
