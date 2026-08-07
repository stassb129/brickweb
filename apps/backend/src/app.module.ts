import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from './contact/contact-message.entity';
import { ContactModule } from './contact/contact.module';
import { databaseConfig } from './database/data-source';
import { ProjectsModule } from './projects/projects.module';
import { Skill } from './skills/skill.entity';
import { SkillsModule } from './skills/skills.module';
import { TimelineEvent } from './timeline/timeline-event.entity';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Skill, TimelineEvent, ContactMessage]),
    ProjectsModule,
    SkillsModule,
    TimelineModule,
    ContactModule,
  ],
})
export class AppModule {}
