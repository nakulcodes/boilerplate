import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/db.module';
import { SharedModule } from './modules/shared/shared.module';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { GraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    SharedModule,
    EventsModule,
    GraphqlModule,
    AuthModule,
    UserModule,
    RoleModule,
    AuditModule,
    StorageModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
