import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { BaseType } from './base.type';
import { User } from './user.type';

@ObjectType()
export class AuditLog extends BaseType {
  @Field({ nullable: true })
  organizationId?: string;

  @Field({ nullable: true })
  actorId?: string;

  @Field()
  method: string;

  @Field()
  path: string;

  @Field()
  action: string;

  @Field(() => Int)
  statusCode: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, unknown>;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => User, { nullable: true })
  actor?: User;
}
