# Class-validator

[Home](../../../../README.md) > [Security](./security.md) > [Class-validator Documentation]

class-validator is a validation library for classes and objects. It allows you to define validation rules using decorators that are applied to class properties. For example, you can use decorators such as ```@IsString()```, ```@IsNotEmpty()```, among others in our DTOs.

```typescript
@InputType()
export class CreateInput {

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    password: string;  
}
```

More detailed information can be found at:
- [GitHub](https://github.com/typestack/class-validator#readme)
- [NestJs](https://docs.nestjs.com/techniques/validation)