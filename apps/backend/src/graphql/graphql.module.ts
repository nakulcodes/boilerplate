import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GqlContext } from './graphql-context.type';
import { formatGraphQLError } from './graphql-error.formatter';
import { GqlPermissionsGuard } from './guards';
import { ResolversModule } from './resolvers.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment =
          configService.get<string>('NODE_ENV') === 'development';

        return {
          autoSchemaFile: join(process.cwd(), 'schema.graphql'),
          sortSchema: true,
          playground: isDevelopment,
          introspection: isDevelopment,
          context: ({ req }): GqlContext => ({ req }),
          formatError: formatGraphQLError,
        };
      },
    }),
    ResolversModule,
  ],
  providers: [GqlPermissionsGuard],
  exports: [GqlPermissionsGuard],
})
export class GraphqlModule {}
