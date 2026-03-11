import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByTypes } from '../../../../patterns/crud-pattern/enums/order-by-type.enum';

@ArgsType()
export class FindDepartmentsArgs {
  @Field(() => OrderByTypes, { nullable: true })
  @IsOptional()
  orderBy?: OrderByTypes;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  countryId?: string;
}
