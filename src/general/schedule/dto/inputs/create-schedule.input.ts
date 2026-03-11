import { Field, InputType } from '@nestjs/graphql';
import { ScheduleType } from '../../enums/schedule-type.enum';

@InputType()
export class CreateScheduleInput {
  @Field(() => String, { nullable: false })
  description: string;

  @Field(() => String, { nullable: false })
  name: string;

  @Field(() => String, { nullable: false })
  cronExpression: string;

  @Field(() => ScheduleType, { nullable: false })
  type: ScheduleType;

  @Field(() => Boolean, { nullable: true })
  active?: boolean;
}
