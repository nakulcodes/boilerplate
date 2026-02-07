import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { CreateApplication } from './usecases/create-application/create-application.usecase';
import { UpdateApplicationStatus } from './usecases/update-application-status/update-application-status.usecase';
import { AssignApplication } from './usecases/assign-application/assign-application.usecase';
import { ListApplications } from './usecases/list-applications/list-applications.usecase';
import { GetApplication } from './usecases/get-application/get-application.usecase';

const USE_CASES = [
  CreateApplication,
  UpdateApplicationStatus,
  AssignApplication,
  ListApplications,
  GetApplication,
];

@Module({
  controllers: [ApplicationController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class ApplicationModule {}
