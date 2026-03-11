import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IDataEntity } from '../interfaces/data-entity.interface';
import { CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export abstract class CrudEntityHardRemoved implements IDataEntity<string> {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_id' })
  @Field(() => ID)
  id: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt!: Date;
}

@Entity()
@ObjectType()
export abstract class CrudEntity extends CrudEntityHardRemoved {
  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
