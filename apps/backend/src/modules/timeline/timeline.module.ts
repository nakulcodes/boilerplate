import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { ListTimeline } from './usecases/list-timeline/list-timeline.usecase';
import { CreateTimelineEvent } from './usecases/create-timeline-event/create-timeline-event.usecase';

const USE_CASES = [ListTimeline, CreateTimelineEvent];

@Module({
  controllers: [TimelineController],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class TimelineModule {}
