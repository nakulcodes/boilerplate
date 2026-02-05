import { Field, ObjectType } from '@nestjs/graphql';
import { BaseType } from './base.type';
import { OrganizationStatus } from './enums';

@ObjectType()
export class Organization extends BaseType {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  domain: string;

  @Field(() => OrganizationStatus)
  status: OrganizationStatus;
}
