import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationInput } from './pagination.input';

export enum HttpMethod {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

registerEnumType(HttpMethod, {
  name: 'HttpMethod',
  description: 'HTTP methods tracked in audit logs',
});

@InputType()
export class ListAuditLogsInput extends PaginationInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  actorId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  action?: string;

  @Field(() => HttpMethod, { nullable: true })
  @IsIn(['POST', 'PUT', 'PATCH', 'DELETE'])
  @IsOptional()
  method?: HttpMethod;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
