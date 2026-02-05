import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
