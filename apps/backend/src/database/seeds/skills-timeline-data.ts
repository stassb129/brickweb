import type { DataSource } from 'typeorm';
import { Skill } from '../../skills/skill.entity';
import { TimelineEvent } from '../../timeline/timeline-event.entity';

export const SKILL_SEED: Array<Partial<Skill>> = [
  { name: 'Node.js', category: 'Backend', level: 90, iconName: 'node' },
  { name: 'Nest.js', category: 'Backend', level: 85, iconName: 'nest' },
  { name: 'Next.js', category: 'Frontend', level: 80, iconName: 'next' },
  { name: 'React', category: 'Frontend', level: 90, iconName: 'react' },
  { name: 'TypeScript', category: 'Frontend', level: 85, iconName: 'ts' },
  { name: 'PostgreSQL', category: 'Database', level: 75, iconName: 'postgres' },
  { name: 'Docker', category: 'Tools', level: 70, iconName: 'docker' },
  { name: 'Git', category: 'Tools', level: 85, iconName: 'git' },
  { name: 'CI/CD', category: 'Tools', level: 70, iconName: 'cicd' },
  { name: 'Web Audio API', category: 'Tools', level: 60, iconName: 'audio' },
];

export const TIMELINE_SEED: Array<Partial<TimelineEvent>> = [
  {
    year: 2018,
    title: 'Начало пути',
    description:
      'Первые шаги в веб-разработке: HTML, CSS, JavaScript и ощущение, что из кирпичей можно собрать что угодно.',
    type: 'education',
    order: 1,
  },
  {
    year: 2020,
    title: 'Первый коммерческий проект',
    description:
      'Сдал первый платный заказ. Научился держать сроки и не ронять стену под нагрузкой продакшена.',
    type: 'work',
    order: 2,
  },
  {
    year: 2022,
    title: 'Фуллстек в стартапе',
    description:
      'Nest.js + Next.js в одном продукте. API, UI, деплой — вся кладка целиком.',
    type: 'work',
    order: 3,
  },
  {
    year: 2024,
    title: 'BrickWeb',
    description:
      'Личное портфолио как интерактивная инсталляция. Каждый проект — кирпич в стене.',
    type: 'achievement',
    order: 4,
  },
];

export async function seedSkillsAndTimeline(dataSource: DataSource): Promise<void> {
  // Schema shifted (uuid → int PK, year string → int). Truncate so local
  // synchronize + seed stay deterministic.
  await dataSource.query('TRUNCATE TABLE skills RESTART IDENTITY CASCADE');
  await dataSource.query(
    'TRUNCATE TABLE timeline_events RESTART IDENTITY CASCADE',
  );

  const skillsRepo = dataSource.getRepository(Skill);
  const timelineRepo = dataSource.getRepository(TimelineEvent);

  for (const data of SKILL_SEED) {
    await skillsRepo.save(skillsRepo.create(data));
    console.log(`skill created: ${data.name}`);
  }

  for (const data of TIMELINE_SEED) {
    await timelineRepo.save(timelineRepo.create(data));
    console.log(`timeline created: ${data.year} ${data.title}`);
  }
}
