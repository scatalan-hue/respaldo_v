import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateScheduleInput } from './create-schedule.input';

@InputType()
export class UpdateScheduleInput extends OmitType(PartialType(CreateScheduleInput), ['name']) {
  @Field(() => ID, { nullable: false })
  id: string;
}
