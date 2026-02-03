import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { USE_CASES } from './usecases';
import { GetSignedUrl } from './usecases/get-signed-url/get-signed-url.usecase';

@Module({
  providers: [...USE_CASES],
  controllers: [StorageController],
  exports: [GetSignedUrl],
})
export class StorageModule {}
