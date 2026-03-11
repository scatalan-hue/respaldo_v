import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FileInfo } from '../../../../general/files/entities/file-info.entity';
import { Contract } from '../../contracts/contract/entity/contract.entity';
import { Lot } from '../../lots/lot/entity/lot.entity';
import { OrganizationProduct } from '../../organizations/organization-product/entities/organization-product.entity';
import { Stamp } from '../../stamp/entity/stamp.entity';
import { MovementStatus } from '../enums/movement-status.enum';
import { TypeMovement } from '../enums/movement-type.enum';
import { Taxpayer } from '../../taxpayer/entity/taxpayer.entity';
import { Transaction } from '../../transactions/transaction/entities/transaction.entity';

@Entity('vudec_movement')
@ObjectType()
export class Movement extends CrudEntity {
  @Column({ nullable: true, length: 1000 })
  @Field(() => String, { nullable: true })
  description: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  expenditureNumber: string;

  @Column({ nullable: true, length: 120 })
  @Field(() => String, { nullable: true })
  movId: string;

  @Column({ nullable: true, length: 120 })
  @Field(() => String, { nullable: true })
  associatedMovement: string;

  @Column({ nullable: true, length: 120 })
  @Field(() => String, { nullable: true })
  typeValue: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  liquidatedValue: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  paidValue: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  documentValue: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  taxBasisValue: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  percentageValue: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  fixedValue: number;

  @Column({ nullable: true })
  @Field(() => TypeMovement, { nullable: true })
  type: TypeMovement;

  @Column({ nullable: true })
  @Field(() => TypeMovement, { nullable: true })
  group: TypeMovement;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  date: Date;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  @Field(() => Number, { nullable: true })
  value: number;

  @Column({ nullable: false, length: 200, default: MovementStatus.Unsent })
  @Field(() => MovementStatus, { nullable: false })
  status: MovementStatus;

  @Column({ nullable: true, length: 2000, type: 'varchar' })
  @Field(() => String, { nullable: true })
  message: string;

  @Column({ name: 'contractId', nullable: true })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.movements, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Contract, { nullable: true })
  contract?: Contract;

  @ManyToOne(() => Stamp, (stamp) => stamp.movements, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Stamp, { nullable: true })
  stamp?: Stamp;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isRevert?: boolean;

  @Column({ name: 'lotId', nullable: true })
  lotId: string;

  @ManyToOne(() => Lot, (lot) => lot.movements, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'lotId' })
  @Field(() => Lot, { nullable: true })
  lot?: Lot;

  @Column({ name: 'organizationProductId', nullable: true })
  organizationProductId: string;

  @ManyToOne(() => OrganizationProduct, (organization) => organization.movements, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'organizationProductId' })
  @Field(() => OrganizationProduct, { nullable: true })
  organizationProduct?: OrganizationProduct;

  @Column({ name: 'documentId', nullable: true })
  documentId: string;

  @ManyToOne(() => FileInfo, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'documentId' })
  @Field(() => FileInfo, { nullable: true })
  document?: FileInfo;

  @Column({ name: 'movementRevertId', nullable: true })
  movementRevertId: string;

  @ManyToOne(() => Movement, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'movementRevertId' })
  @Field(() => Movement, { nullable: true })
  movementRevert?: Movement;

  @Column({ name: 'taxpayerId', nullable: true })
  taxpayerId: string;

  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.movements, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'taxpayerId' })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;

  @Column({ name: 'transactionId', nullable: true })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.movements, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'transactionId' })
  @Field(() => Transaction, { nullable: true })
  transaction?: Transaction;
}
