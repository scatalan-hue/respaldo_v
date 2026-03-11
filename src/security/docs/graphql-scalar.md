# GraphQL-Scalars

[Home](../../../../README.md) > [Security](./security.md) > [GraphQL-Scalars Documentation]

In the context of GraphQL, Scalars are scalar data types such as ```String```, ```Int```, ```Float```, ```Boolean```, ```ID```  and custom types that you can define. Custom Scalars allow you to validate and transform data before it is processed by the API. This customization of validations allows us to reinforce the security of our API because it ensures that the data strictly complies with the defined rules.

## Creation of a new customized GrapQL Scalar

This file must be created manually at the same level as the folders of each module, inside a directory named ``scalars``.

```
📦users
 ┣ 📂dto
 ┣ 📂entities
 ┣ 📂enums
 ┣ 📂resolvers
 ┣ 📂scalars
 ┃ ┗ 📜password.scalar.ts
 ┣ 📂services
 ┗ 📜users.module.ts
```

### File Structure

#### (yourName).scalar.ts

```typescript
export const CustomScalar = new GraphQLScalarType({
  name: 'yourName',
  description: 'A simple description',
  serialize: /* Your function and validation */,
  parseValue: /* Your function and validation */,
  parseLiteral: /* Your function and validation */
})
```

## Scalar use

It must be imported into the validation file or DTO and used in the GraphQL decorator like this:

```typescript
@InputType()
export class CreateInput {

    @Field(() => /* YourCustomScalar */)
    @IsString()
    @IsNotEmpty()
    password: string;  
}
```

## Scalar Registration

It must be registered in the ```app.module.ts``` in GraphQL imports:

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      resolvers: {
        /* YourCustomScalar */
       },
    }),  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

More detailed information can be found at:
- [GitHub](https://github.com/Urigo/graphql-scalars)
- [NestJs](https://docs.nestjs.com/graphql/scalars)