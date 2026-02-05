import { Field, ObjectType } from '@nestjs/graphql';
import { BaseType } from './base.type';

@ObjectType()
export class Role extends BaseType {
  @Field()
  name: string;

  @Field(() => [String])
  permissions: string[];

  @Field()
  organizationId: string;

  @Field()
  isDefault: boolean;
}
