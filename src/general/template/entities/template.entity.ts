import { Field, ObjectType } from '@nestjs/graphql';
import { FileInfo } from 'src/general/files/entities/file-info.entity';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('grl_template')
@ObjectType()
export class Template extends CrudEntity {
  @Column()
  @Field(() => String)
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => FileInfo)
  @ManyToOne(() => FileInfo, undefined, { lazy: true })
  file?: FileInfo;
}
