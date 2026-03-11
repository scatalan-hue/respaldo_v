import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByTypes } from '../../../../patterns/crud-pattern/enums/order-by-type.enum';

@ArgsType()
export class FindCountriesArgs {
  @Field(() => OrderByTypes, { nullable: true })
  @IsOptional()
  orderBy?: OrderByTypes;
}
