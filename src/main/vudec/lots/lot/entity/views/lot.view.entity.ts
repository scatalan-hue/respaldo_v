import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { JoinColumn, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';
import { Status } from '../../../../contracts/contract/enum/contract-status.enum';
import V_VUDEC_LOTS_QUERY from '../queries/lot.view.query';
import { Organization } from 'src/main/vudec/organizations/organization/entity/organization.entity';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_LOTS_QUERY)
@ObjectType()
export class LotView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  name?: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  consecutive?: string;

  @ViewColumn()
  @Field(() => Date, { nullable: false })
  createdAt: Date;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  organizationId: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  organizationParentId?: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  organizationName?: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  productId: string;

  @ViewColumn()
  @Field(() => Number)
  totalPending?: number;

  @ViewColumn()
  @Field(() => Number)
  totalSend?: number;

  @ViewColumn()
  @Field(() => Number)
  totalError?: number;

  @ViewColumn()
  @Field(() => Number)
  total?: number;

  @ViewColumn()
  @Field(() => Status, { nullable: false })
  status: Status;
}
