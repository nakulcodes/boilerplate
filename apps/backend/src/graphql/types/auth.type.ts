import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';
import { Organization } from './organization.type';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;

  @Field(() => Organization)
  organization: Organization;
}

@ObjectType()
export class TokenResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
