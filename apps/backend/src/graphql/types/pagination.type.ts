import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';
import { AuditLog } from './audit-log.type';

export interface IPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function PaginatedResponse<T>(
  classRef: Type<T>,
): Type<IPaginatedResponse<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass implements IPaginatedResponse<T> {
    @Field(() => [classRef])
    data: T[];

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    totalPages: number;

    @Field()
    hasNextPage: boolean;

    @Field()
    hasPreviousPage: boolean;
  }

  return PaginatedResponseClass as Type<IPaginatedResponse<T>>;
}

@ObjectType()
export class PaginatedUserList extends PaginatedResponse(User) {}

@ObjectType()
export class PaginatedAuditLogList extends PaginatedResponse(AuditLog) {}
