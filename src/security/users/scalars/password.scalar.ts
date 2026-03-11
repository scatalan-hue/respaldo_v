import { BadRequestException } from '@nestjs/common';
import { GraphQLScalarType, ValueNode } from 'graphql';
import { validateString } from '../../../common/functions';

export const CustomPasswordScalar = new GraphQLScalarType({
  name: 'ValidatePassword',
  description: 'Description',
  serialize: (value: unknown) => {
    if (typeof value === 'string') {
      if (!validateString(value)) {
        throw new BadRequestException('Password does not meet security parameters');
      }
      return value;
    }
  },
  parseValue: (value: unknown) => {
    if (typeof value === 'string') {
      if (!validateString(value)) {
        throw new BadRequestException('Password does not meet security parameters');
      }
      return value;
    }
    throw new BadRequestException('Password does not meet security parameters');
  },
  parseLiteral: (ast: ValueNode) => {
    if (ast.kind === 'StringValue') {
      if (!validateString(ast.value)) {
        throw new BadRequestException('Password does not meet security parameters');
      }
      return ast.value;
    }
    throw new BadRequestException('Password does not meet security parameters');
  },
});
