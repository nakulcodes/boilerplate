import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseType {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
