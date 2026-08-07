import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TimelineEventType = 'work' | 'education' | 'achievement';

@Entity('timeline_events')
export class TimelineEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'varchar', length: 40 })
  type: TimelineEventType;

  @Column({ type: 'int', default: 0 })
  order: number;
}
