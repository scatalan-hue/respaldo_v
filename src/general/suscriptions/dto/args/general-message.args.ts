import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeMessage, TypeSuscription } from '../../enums/type-suscription.enum';

export class GeneralSuscription {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(TypeMessage)
  @IsNotEmpty()
  type: TypeMessage;

  @IsString()
  @IsNotEmpty()
  subscription: string;

  @IsOptional()
  info?: NotificationModel | ProgressModel;
}

export class ProgressModel {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  maxItem: number;

  @IsNumber()
  @IsNotEmpty()
  currentItem: number;

  @IsString()
  @IsNotEmpty()
  percentage: string;

  __typename: string;
}

export class NotificationModel {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TypeSuscription)
  @IsNotEmpty()
  type: TypeSuscription;

  __typename: string;
}
