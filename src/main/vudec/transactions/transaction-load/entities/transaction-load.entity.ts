import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { LoadStatus } from '../enums/save-transaction.enums';
import { User } from 'src/security/users/entities/user.entity';
import { FileInfo } from 'src/general/files/entities/file-info.entity';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';

@ObjectType()
@Entity({ name: 'transaction_load' })
export class TransactionLoadEntity extends CrudEntity {
  @Column({ name: 'userId', nullable: false })
  userId: string;

  @Column({ name: 'loadId', nullable: false })
  loadId: string;

  @Column({ type: 'varchar', length: 50, default: LoadStatus.PENDING, nullable: false })
  @Field(() => LoadStatus)
  status: LoadStatus;

  @Field(() => String, { nullable: true })
  @Column({ name: 'loadErrorId', nullable: true })
  loadErrorId?: string

  @OneToOne(() => FileInfo, { lazy: true, nullable: true })
  @JoinColumn({ name: 'loadErrorId' })
  @Field(() => FileInfo, { nullable: true })
  loadError?: FileInfo;

  @ManyToOne(() => User, (user) => user.transactionLoads, { lazy: true, nullable: false })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: false })
  user: User;

  @OneToOne(() => FileInfo, { lazy: true, nullable: false })
  @JoinColumn({ name: 'loadId' })
  @Field(() => FileInfo, { nullable: false })
  load?: FileInfo;
}
