import { Column, Entity } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity({ name: 'grl_documentType' })
@ObjectType()
export class DocumentType extends CrudEntity {
  @Column()
  @Field(() => String)
  document: string;
}
