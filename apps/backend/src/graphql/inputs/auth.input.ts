import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organizationName?: string;
}

@InputType()
export class UpdatePasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

@InputType()
export class PasswordResetRequestInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class PasswordResetInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
