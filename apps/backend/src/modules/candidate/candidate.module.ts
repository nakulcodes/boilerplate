import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CreateCandidate } from './usecases/create-candidate/create-candidate.usecase';
import { UpdateCandidate } from './usecases/update-candidate/update-candidate.usecase';
import { ListCandidates } from './usecases/list-candidates/list-candidates.usecase';
import { GetCandidate } from './usecases/get-candidate/get-candidate.usecase';

const USE_CASES = [
  CreateCandidate,
  UpdateCandidate,
  ListCandidates,
  GetCandidate,
];

@Module({
  controllers: [CandidateController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class CandidateModule {}
