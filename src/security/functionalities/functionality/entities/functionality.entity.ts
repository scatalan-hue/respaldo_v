import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { RoleFxUrl } from '../../../roles/role-fx-url/entities/role-fx-url.entity';
import { RoleFx } from '../../../roles/role/entities/role-fx.entity';
import { FunctionalityFx } from '../../functionality-fx/entities/functionality-fx.entity';

@Entity('sec_functionality')
@ObjectType()
export class Functionality extends CrudEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column()
  @Field()
  key: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon?: string;

  @Column({ default: 'No hay descripción de permiso, si desea puede asignarlo' })
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  url?: string;

  // @ManyToOne(() => FileInfo, (image) => image.functionality, { lazy: true, nullable: true })
  // @Field(() => FileInfo, { nullable: true })
  // image?: FileInfo;

  @ManyToMany(() => Functionality, (functionality) => functionality.parent, { lazy: true, cascade: false })
  @JoinTable({
    name: 'sec_functionality_fx',
    synchronize: false,
    joinColumn: {
      name: 'childrenId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'parentId',
      referencedColumnName: 'id',
    },
  })
  @Field(() => [Functionality], { nullable: true })
  parent: Functionality[];

  @ManyToMany(() => Functionality, (functionality) => functionality.children, { lazy: true, cascade: false })
  @JoinTable({
    name: 'sec_functionality_fx',
    synchronize: false,
    joinColumn: {
      name: 'parentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'childrenId',
      referencedColumnName: 'id',
    },
  })
  @Field(() => [Functionality], { nullable: true })
  children: Functionality[];

  @OneToMany(() => FunctionalityFx, (functionalityFx) => functionalityFx.parent, { lazy: true, cascade: true })
  @Field(() => [FunctionalityFx], { nullable: true })
  functionalityFxParent?: FunctionalityFx[];

  @OneToMany(() => FunctionalityFx, (functionalityFx) => functionalityFx.children, { lazy: true, cascade: true })
  @Field(() => [FunctionalityFx], { nullable: true })
  functionalityFxChildren?: FunctionalityFx[];

  @OneToMany(() => RoleFx, (roleFx) => roleFx.functionality, { cascade: true })
  @Field(() => [RoleFx])
  roleFx: RoleFx[];

  @OneToMany(() => RoleFxUrl, (roleFxUrl) => roleFxUrl.functionality, { cascade: true })
  @Field(() => [RoleFxUrl])
  roleFxUrl: RoleFxUrl[];
}
