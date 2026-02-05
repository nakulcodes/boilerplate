import { Field, ObjectType } from '@nestjs/graphql';
import { BaseType } from './base.type';
import { UserStatus } from './enums';
import { Role } from './role.type';
import { Organization } from './organization.type';

@ObjectType()
export class User extends BaseType {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field()
  isActive: boolean;

  @Field()
  onboarded: boolean;

  @Field()
  organizationId: string;

  @Field({ nullable: true })
  roleId?: string;

  @Field({ nullable: true })
  invitedBy?: string;

  @Field(() => Role, { nullable: true })
  role?: Role;

  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @Field(() => User, { nullable: true })
  inviter?: User;
}
