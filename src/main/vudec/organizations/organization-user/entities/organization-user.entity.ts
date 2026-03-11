import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../../../patterns/crud-pattern/entities/crud-entity';
import { User } from '../../../../../security/users/entities/user.entity';
import { Organization } from '../../organization/entity/organization.entity';

@Entity('vudec_organization_user')
@ObjectType()
export class OrganizationUser extends CrudEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => Organization, (organization) => organization.organizationUsers, { lazy: true, nullable: false })
  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @ManyToOne(() => User, (user) => user.organizationUsers, {
    lazy: true,
    nullable: false,
  })
  @Field(() => User, { nullable: true })
  user?: User;
}
