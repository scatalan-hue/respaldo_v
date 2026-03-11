import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { User } from 'src/security/users/entities/user.entity';
import { WebserviceLogStatus } from '../enums/webservice-log-status.enum';
import { HttpMethod } from '../enums/http-method.enum';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';
import { Movement } from 'src/main/vudec/movement/entity/movement.entity';
import { OrganizationProduct } from 'src/main/vudec/organizations/organization-product/entities/organization-product.entity';

@Entity('grl_webservice_log')
@ObjectType()
export class WebserviceLog extends CrudEntity {

  @Column({ nullable: false, type: 'varchar', length: 100 })
  @Field(() => String)
  serviceName: string;

  @Column({ nullable: false, type: 'varchar', length: 500 })
  @Field(() => String)
  endpoint: string;

  @Column({ nullable: false })
  @Field(() => HttpMethod)
  httpMethod: HttpMethod;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { nullable: true })
  request?: string;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { nullable: true })
  response?: string;

  @Column({ nullable: false, default: WebserviceLogStatus.Pending })
  @Field(() => WebserviceLogStatus)
  status: WebserviceLogStatus;

  @Column({ nullable: true, type: 'int' })
  @Field(() => Number, { nullable: true })
  statusCode?: number;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Column({ name: 'userId', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { lazy: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user?: User;

  @Column({ name: 'transactionId', nullable: true })
  transactionId?: string;

  @ManyToOne(() => Transaction, { lazy: true, nullable: true })
  @JoinColumn({ name: 'transactionId' })
  @Field(() => Transaction, { nullable: true })
  transaction?: Transaction;

  @Column({ name: 'movementId', nullable: true })
  movementId?: string;

  @ManyToOne(() => Movement, { lazy: true, nullable: true })
  @JoinColumn({ name: 'movementId' })
  @Field(() => Movement, { nullable: true })
  movement?: Movement;

  @Column({ name: 'organizationProductId', nullable: true })
  organizationProductId?: string;

  @ManyToOne(() => OrganizationProduct, { lazy: true, nullable: true })
  @JoinColumn({ name: 'organizationProductId' })
  @Field(() => OrganizationProduct, { nullable: true })
  organizationProduct?: OrganizationProduct;
}