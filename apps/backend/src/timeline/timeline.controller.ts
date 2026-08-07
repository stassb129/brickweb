import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TimelineEvent } from './timeline-event.entity';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  findAll(): Promise<TimelineEvent[]> {
    return this.timelineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TimelineEvent> {
    return this.timelineService.findOne(id);
  }
}
