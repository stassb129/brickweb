import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
