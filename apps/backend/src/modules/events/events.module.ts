import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { mailService } from '@boilerplate/core';
import { AppEventEmitter } from './services/event-emitter.service';
import { UserEmailListener } from './listeners/user-email.listener';

const LISTENERS = [UserEmailListener];

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  providers: [mailService, AppEventEmitter, ...LISTENERS],
  exports: [AppEventEmitter],
})
export class EventsModule {}
