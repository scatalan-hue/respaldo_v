import { Field } from '@nestjs/graphql';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

type ReturnTypeFunc = (type?: void) => Function;

export function FilterableField(returnTypeFuncOrOptions: ReturnTypeFunc): PropertyDecorator {
  return (target: Record<string, any>, propertyName: string | symbol, descriptor?: PropertyDescriptor) => {
    Field()(target, propertyName, descriptor);
    Reflect.defineMetadata('graphql:filterableField', true, target, propertyName);
  };
}
