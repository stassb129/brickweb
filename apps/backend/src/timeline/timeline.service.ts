import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimelineEvent } from './timeline-event.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TimelineEvent)
    private readonly timelineRepository: Repository<TimelineEvent>,
  ) {}

  findAll(): Promise<TimelineEvent[]> {
    return this.timelineRepository.find({
      order: { order: 'ASC', year: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TimelineEvent> {
    const event = await this.timelineRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Timeline event #${id} not found`);
    }
    return event;
  }
}
