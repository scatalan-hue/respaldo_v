import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateFileBySourceInput {
  /**
   * El nombre del archivo, necesario solo cuando se envía `fileBase64` para crear un archivo desde un string en base64.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty({
    description: 'Nombre del archivo. Solo se necesita si se envía fileBase64.',
  })
  @IsString()
  filename?: string;

  /**
   * El ID de un archivo existente. Si este campo es proporcionado, indica que se debe reutilizar un archivo previamente almacenado.
   * **Usar solo este campo si se está asignando un archivo existente.**
   */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @ApiProperty({
    description: 'ID de un archivo existente. Usar solo si se reutiliza un archivo almacenado previamente.',
  })
  @IsUUID()
  fileId?: string;

  /**
   * URL de un archivo. Este campo es opcional y debe ser proporcionado solo si el archivo se obtiene desde una URL.
   * **Usar solo este campo para especificar una URL de archivo.**
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty({
    description: 'URL de un archivo. Usar solo si el archivo se obtiene desde una URL.',
  })
  @IsString()
  fileUrl?: string;

  /**
   * Contenido del archivo en formato base64. Utilizar junto con `filename` para crear un archivo a partir de un string en base64.
   * **Usar solo si el archivo se envía en formato base64.**
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty({
    description: 'Contenido del archivo en base64. Usar junto con filename.',
  })
  @IsString()
  fileBase64?: string;
}
