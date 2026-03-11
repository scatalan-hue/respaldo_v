import { BadRequestException } from '@nestjs/common';
import { And, Between, Brackets, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Constructable } from '../types/constructable.type';
import { IFindArgs } from '../interfaces/find-args.interface';
import { DefaultArgs } from '../classes/args/default.args';
import { IDataEntity } from '../interfaces/data-entity.interface';

const conditions = {
  _eq: (value) => value,
  _neq: (value) => Not(value),
  _gt: (value) => MoreThan(value),
  _gte: (value) => MoreThanOrEqual(value),
  _lt: (value) => LessThan(value),
  _lte: (value) => LessThanOrEqual(value),
  _in: (value) => In(value),
  _between: (value) => Between(value[0], value[1]),
  _notbetween: (value) => Not(Between(value[0], value[1])),
  _startswith: (value) => Like(value + '%'),
  _notstartswith: (value) => Not(Like(value + '%')),
  _endswith: (value) => Like('%' + value),
  _notendswith: (value) => Not(Like('%' + value)),
  _contains: (value) => Like('%' + value + '%'),
  _notcontains: (value) => Not(Like('%' + value + '%')),
  _like: (value) => Like(value),
  _notlike: (value) => Not(Like(value)),
};

const conditionsKeys = Object.keys(conditions);

function fixBracketQueryBuilder(bracketQueryBuilder, queryBuilder) {
  //bracketQueryBuilder.expressionMap.joinAttributes = queryBuilder.expressionMap.joinAttributes;
  bracketQueryBuilder.expressionMap.joinAttributes = [...queryBuilder.expressionMap.joinAttributes];
}

export function QueryBuilderHelper<PrimaryKeyType, EntityType extends IDataEntity<PrimaryKeyType>, FindArgsType extends IFindArgs = DefaultArgs>(
  entityType: Constructable<EntityType>,
  argsType: Constructable<FindArgsType>,
) {
  class QueryBuilderHelper {
    static getQueryBuilder(repository: Repository<EntityType>, args?: FindArgsType) {
      const queryBuilder = repository.createQueryBuilder('aa');

      if (args) QueryBuilderHelper.applyArgs(queryBuilder, args);

      return queryBuilder;
    }

    static applyArgs(queryBuilder: SelectQueryBuilder<EntityType>, args: FindArgsType) {
      if (args.where) {
        const whereContext = {
          queryBuilder,
          alias: queryBuilder.alias,
          relations: [],
          constructField: (fieldName, value) => {
            return { [fieldName]: value };
          },
        };
        queryBuilder.where(QueryBuilderHelper.getWhereCondition(whereContext, args.where));
      }

      if (args.orderBy) QueryBuilderHelper.applyOrderBy(queryBuilder, args.orderBy);

      if (args.pagination) {
        queryBuilder.offset(args.pagination.skip);
        queryBuilder.limit(args.pagination.take);
      }
    }

    static applyOrderBy(queryBuilder: SelectQueryBuilder<EntityType>, orderBy: any[]) {
      orderBy.forEach((order) => {
        const keys = Object.keys(order);

        keys.forEach((key) => {
          const value = order[key];

          if (value) queryBuilder.addOrderBy(queryBuilder.alias + '.' + key, value);
        });
      });
    }

    static getWhereCondition(whereContext, where: object): any {
      const andConditions = [];
      const orConditions = [];

      const keys = Object.keys(where);

      keys.forEach((key) => {
        const value = where[key];

        switch (key) {
          case '_and':
            andConditions.push(...QueryBuilderHelper.getComplexConditions(whereContext, value));
            break;
          case '_or':
            orConditions.push(...QueryBuilderHelper.getComplexConditions(whereContext, value));
            break;
          default:
            if (QueryBuilderHelper.hasFieldConditions(key, value)) andConditions.push(QueryBuilderHelper.getFieldConditions(whereContext, key, value));
            else andConditions.push(QueryBuilderHelper.relationCondition(whereContext, key, value));
        }
      });

      const andBracket = new Brackets((queryBuilder) => {
        fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

        andConditions.forEach((condition) => {
          queryBuilder.andWhere(condition);
        });
      });

      if (orConditions.length === 0) return andBracket;

      const orBracket = new Brackets((queryBuilder) => {
        fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

        if (andConditions.length > 0) queryBuilder.where(andBracket);

        orConditions.forEach((condition) => {
          queryBuilder.orWhere(condition);
        });
      });

      return orBracket;
    }

    static relationCondition(whereContext, relationName: string, condition: object) {
      const alias: string = QueryBuilderHelper.addRelation(whereContext, relationName);

      const oldConstructField = whereContext.constructField;

      const constructField = (fieldName, value) => {
        return oldConstructField(relationName, { [fieldName]: value });
      };

      return QueryBuilderHelper.getWhereCondition({ ...whereContext, alias, constructField }, condition);
    }

    static addRelation(whereContext, relationName: string): string {
      const property = whereContext.alias + '.' + relationName;

      const foundRelation = whereContext.relations.find((item) => item.property === property);

      if (foundRelation) return foundRelation.alias;

      const alias = whereContext.queryBuilder.alias + (whereContext.relations.length + 1);

      whereContext.queryBuilder.leftJoin(property, alias);

      whereContext.relations.push({ property, alias });

      return alias;
    }

    static hasFieldConditions(fieldName: string, value: object): boolean {
      if (value === undefined || value === null) throw new BadRequestException(`field cannot be empty`);

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date || value instanceof Array) return true;

      const objKeys = Object.keys(value);

      if (objKeys.length === 0) throw new BadRequestException(`field cannot be empty`);

      if (objKeys.some((item) => conditionsKeys.includes(item))) return true;

      return false;
    }

    static getFieldConditions(whereContext, fieldName: string, fieldCondition: object) {
      if (typeof fieldCondition === 'string' || typeof fieldCondition === 'number' || typeof fieldCondition === 'boolean' || fieldCondition instanceof Date) {
        return whereContext.constructField(fieldName, fieldCondition);
      }

      if (fieldCondition instanceof Array) {
        return whereContext.constructField(fieldName, In(fieldCondition));
      }

      const keys = Object.keys(fieldCondition);

      const opColection = [];

      keys.forEach((key) => {
        const value = fieldCondition[key];
        const cond = conditions[key];

        if (value !== undefined && value !== undefined) opColection.push(cond(value));
      });

      if (opColection.length === 0) throw new BadRequestException(`key ${fieldName} must have a valid condition: ${JSON.stringify(fieldCondition)}`);

      let condition = undefined;

      if (opColection.length === 1) condition = opColection[0];
      else condition = And(...opColection);

      return whereContext.constructField(fieldName, condition);
    }

    static getComplexConditions(whereContext, conditions) {
      return conditions.map((condition) => QueryBuilderHelper.getWhereCondition(whereContext, condition));
    }
  }

  return QueryBuilderHelper;
}
