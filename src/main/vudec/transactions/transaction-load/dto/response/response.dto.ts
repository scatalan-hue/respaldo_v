import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ObtainErrorDbDto {
    @Field()
    fileId: string;

}

@ObjectType()
export class ResponseErrorUpdatingTransaction {
    @Field({ nullable: true })
    fileErrorId: string | null;

    @Field()
    message: string;
}