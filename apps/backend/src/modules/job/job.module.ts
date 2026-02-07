import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { CreateJob } from './usecases/create-job/create-job.usecase';
import { UpdateJob } from './usecases/update-job/update-job.usecase';
import { PublishJob } from './usecases/publish-job/publish-job.usecase';
import { CloseJob } from './usecases/close-job/close-job.usecase';
import { ListJobs } from './usecases/list-jobs/list-jobs.usecase';
import { GetJob } from './usecases/get-job/get-job.usecase';

const USE_CASES = [
  CreateJob,
  UpdateJob,
  PublishJob,
  CloseJob,
  ListJobs,
  GetJob,
];

@Module({
  controllers: [JobController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class JobModule {}
