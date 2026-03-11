import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateSecUserTokenInput } from './create-sec-user-token.inputs';

@InputType()
export class UpdateSecUserTokeInput extends PartialType(CreateSecUserTokenInput) {}
