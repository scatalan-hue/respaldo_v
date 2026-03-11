import { OrganizationTaxpayer } from '../../organizations/organization-taxpayer/entities/organization-taxpayer.entity';
import { TransactionHistory } from '../../transactions/transaction-history/entities/transaction-history.entity';
import { Transaction } from '../../transactions/transaction/entities/transaction.entity';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Contract } from '../../contracts/contract/entity/contract.entity';
import { Movement } from '../../movement/entity/movement.entity';
import { Field, Float, ObjectType } from '@nestjs/graphql';
import { TypeDoc } from '../enums/taxpayer-type.enum';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('vudec_taxpayer')
@ObjectType()
export class Taxpayer extends CrudEntity {
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  middleName?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  lastName: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  secondSurname?: string;

  @Column({
    nullable: false,
    unique: true,
    type: 'varchar',
    length: '40'
  })
  @Field(() => String, { nullable: false })
  taxpayerNumber: string;

  @Column({ nullable: true, length: 200 })
  @Field(() => TypeDoc, { nullable: true })
  taxpayerNumberType: TypeDoc;

  @Column({ nullable: true, length: 200 })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true, length: 40 })
  @Field({ nullable: true })
  phone?: string;

  @OneToMany(() => OrganizationTaxpayer, (organizationTaxpayer) => organizationTaxpayer.taxpayer, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationTaxpayer], { nullable: true })
  organizationTaxpayers?: OrganizationTaxpayer[];

  @OneToMany(() => Movement, (movement) => movement.taxpayer, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Movement], { nullable: true })
  movements?: Movement[];

  @OneToMany(() => Contract, (contract) => contract.taxpayer, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Contract], { nullable: true })
  contracts?: Contract[];

  @OneToMany(() => Transaction, (transaction) => transaction.taxpayer, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];

  @OneToMany(() => TransactionHistory, (transactionHistory) => transactionHistory.transaction, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [TransactionHistory], { nullable: true })
  transactionHistories?: TransactionHistory[];
}
