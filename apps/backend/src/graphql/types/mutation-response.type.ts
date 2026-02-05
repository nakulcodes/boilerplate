import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuccessResponse {
  @Field()
  success: boolean;
}

@ObjectType()
export class InviteUserResponse {
  @Field()
  userId: string;

  @Field()
  inviteLink: string;

  @Field()
  emailSent: boolean;
}

@ObjectType()
export class ResendInviteResponse {
  @Field()
  success: boolean;

  @Field()
  inviteLink: string;

  @Field()
  emailSent: boolean;
}
