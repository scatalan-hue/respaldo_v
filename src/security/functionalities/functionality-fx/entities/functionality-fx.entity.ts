import { Field, ObjectType } from "@nestjs/graphql";
import { Entity, ManyToOne } from "typeorm";
import { CrudEntity } from "../../../../patterns/crud-pattern/entities/crud-entity";
import { Functionality } from "../../functionality/entities/functionality.entity";

@Entity({ name: "sec_functionality_fx" })
@ObjectType()
export class FunctionalityFx extends CrudEntity {
  @Field(() => Functionality, { nullable: true })
  @ManyToOne(() => Functionality, (role) => role.functionalityFxParent, { lazy: true, nullable: false })
  parent: Functionality;

  @Field(() => Functionality, { nullable: true })
  @ManyToOne(() => Functionality, (user) => user.functionalityFxChildren, { lazy: true, nullable: false })
  children: Functionality;
}
