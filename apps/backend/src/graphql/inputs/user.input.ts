import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../types/enums';
import { PaginationInput } from './pagination.input';

@InputType()
export class InviteUserInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  roleId?: string;
}

@InputType()
export class ListUsersInput extends PaginationInput {
  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  status?: UserStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  invitedBy?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  roleId?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;
}

@InputType()
export class AcceptInviteInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  inviteToken: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
