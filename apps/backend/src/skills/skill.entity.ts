import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 40 })
  category: string;

  @Column({ type: 'int', default: 50 })
  level: number;

  @Column({ type: 'varchar', length: 80, default: '' })
  iconName: string;
}
