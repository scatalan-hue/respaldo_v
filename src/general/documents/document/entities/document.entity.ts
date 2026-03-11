import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';

@Entity({ name: 'grl_document' })
@ObjectType()
export class Document extends CrudEntity {
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  name?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  externalId?: string;

  @Column({
    default: false,
    comment: 'This column is for deciding whether to return the document at the end of the instance.',
  })
  @Field(() => Boolean)
  hasFinalDocument: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasCanceled: boolean;

  // @ManyToOne(() => Organization, (organization) => organization.documents, {
  //   lazy: true,
  //   nullable: true
  // })
  // @Field(() => Organization, { nullable: true })
  // organization?: Organization;

  // @ManyToOne(() => Product, (product) => product.documents, {
  //   lazy: true
  // })
  // @Field(() => Product, { nullable: true })

  // @ManyToOne(() => Template, (template) => template.documents, {
  //   lazy: true,
  //   nullable: true
  // })
  // @Field(() => Template, { nullable: true })
  // template?: Template;

  // @OneToMany(() => DocumentVersion, (documentVersion) => documentVersion.document, { lazy: true })
  // @Field(() => [DocumentVersion], { nullable: true })
  // documentVersion: DocumentVersion[];
}
