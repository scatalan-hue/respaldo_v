import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum FunctionalityTag {
  STANDARD = "STANDARD",
  CUSTOM = "CUSTOM",
  METHOD = "METHOD",
  RESOLVER = "RESOLVER",
  CONTROLLER = "CONTROLLER",
  MODULE = "MODULE",
  PARENT = "PARENT"
}

registerEnumType(FunctionalityTag, {
  name: "FunctionalityTag"
});

@ObjectType()
export class FunctionalityModel {
  constructor(any: any) {
    const { name, key, description, tags, url, title, icon, children, ...rest } = any;
    this.name = name;
    this.key = key;
    this.description = description;
    this.title = title;
    this.url = url;
    this.icon = icon;
    this.tags = tags;
    this.children = children || Object.values(rest);
  }

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  key: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  url?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [FunctionalityTag], { nullable: true })
  @IsString()
  @IsOptional()
  tags?: FunctionalityTag[];

  @Field(() => [FunctionalityModel], { nullable: true })
  @IsString()
  @IsOptional()
  children?: FunctionalityModel[];
}

@ObjectType()
export class FunctionalityKeysModel {
  constructor(functionalityKeys) {
    const { key, name } = functionalityKeys;
    this.tags = [FunctionalityTag.RESOLVER, FunctionalityTag.PARENT];
    this.CREATE = new FunctionalityModel({
      key: `${key}.create`,
      name: "CREATE",
      tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
      description: `Create new ${name}`
    });
    this.FIND = new FunctionalityModel({
      key: `${key}.find`,
      name: "FIND",
      tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
      description: `Find ${name}/s`
    });
    this.UPDATE = new FunctionalityModel({
      key: `${key}.update`,
      name: "UPDATE",
      tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
      description: `Update ${name}`
    });
    this.ADD = new FunctionalityModel({
      key: `${key}.add`,
      name: "ADD",
      tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
      description: `Add ${name}`
    });
    this.REMOVE = new FunctionalityModel({
      key: `${key}.remove`,
      name: "REMOVE",
      tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
      description: `Remove ${name}`
    });
  }

  @Field(() => [String], { nullable: true })
  @IsString()
  @IsOptional()
  tags?: FunctionalityTag[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  CREATE?: FunctionalityModel;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  FIND?: FunctionalityModel;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  UPDATE?: FunctionalityModel;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  REMOVE?: FunctionalityModel;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ADD?: FunctionalityModel;
}
