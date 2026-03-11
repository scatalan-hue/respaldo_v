import { OrganizationUser } from '../../../main/vudec/organizations/organization-user/entities/organization-user.entity';
import { TransactionLoadEntity } from 'src/main/vudec/transactions/transaction-load/entities/transaction-load.entity';
import { Department } from '../../../general/department/entities/department.entity';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { UserDocumentTypes } from '../../../common/enum/document-type.enum';
import { Country } from '../../../general/country/entities/country.entity';
import { UserRole } from '../../user-role/entities/user-role.entity';
import { City } from '../../../general/city/entities/city.entity';
import { UserKey } from '../../user-key/entities/user-key.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserStatusTypes } from '../enums/status-type.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserTypes } from '../enums/user-type.enum';

@Entity({ name: 'sec_user' })
@ObjectType()
export class User extends CrudEntity {
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

  @Column({ nullable: true })
  @Field(() => String)
  email: string;

  @Column({ nullable: true, length: 1000 })
  password?: string;

  @Column({ nullable: true })
  tempPassword?: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ default: 0 })
  attemptsCycles: number;

  @Column({ nullable: true })
  lastFailedAttemptDate: Date;

  @Column({ nullable: true })
  @Field(() => UserDocumentTypes, { nullable: true })
  identificationType?: UserDocumentTypes;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  identificationNumber?: string;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  dateIssue?: Date;

  @Column({ nullable: true })
  @Field(() => UserDocumentTypes, { nullable: true })
  legalRepresentativeIdentificationType?: UserDocumentTypes;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  legalRepresentativeIdentificationNumber?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phoneCountryCode?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  hasRural?: boolean;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  confirmationCode?: string;

  @Column({ default: false, nullable: true })
  @Field(() => Boolean, { nullable: true })
  hasExternalCreation?: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  temporalPassword: boolean;

  @Column({ default: UserStatusTypes.Inactive })
  @Field(() => UserStatusTypes)
  status: UserStatusTypes;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  credentialsExpirationDate?: Date;

  @Column({ default: false })
  @Field(() => Boolean)
  phoneVerification: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  emailVerification: boolean;

  @Column()
  @Field(() => UserTypes)
  type: UserTypes;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { lazy: true, cascade: true })
  @Field(() => [UserRole], { nullable: true })
  userRoles?: UserRole[];

  @ManyToOne(() => City, (city) => city.id, { lazy: true, nullable: true })
  @Field(() => City, { nullable: true })
  city?: City;

  @ManyToOne(() => Department, (department) => department.id, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Department, { nullable: true })
  department?: Department;

  @ManyToOne(() => Country, (country) => country.id, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Country, { nullable: true })
  country: Country;

  @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.user, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationUser], { nullable: true })
  organizationUsers?: OrganizationUser[];

  @OneToMany(() => UserKey, (userKeys) => userKeys.user, { lazy: true })
  @Field(() => [UserKey], { nullable: true })
  userKeys?: UserKey[];

  @OneToMany(() => TransactionLoadEntity, (t) => t.user, { lazy: true, nullable: true })
  @Field(() => [TransactionLoadEntity], { nullable: true })
  transactionLoads?: TransactionLoadEntity[];
}
