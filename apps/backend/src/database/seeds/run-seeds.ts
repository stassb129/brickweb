import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Project } from '../../projects/project.entity';
import { seedSkillsAndTimeline } from './skills-timeline-data';

const projects: Array<Partial<Project>> = [
  {
    slug: 'soundwall',
    title: 'SoundWall',
    description:
      'Цифровая стена звука, где пользователи создают эмбиенты из сэмплов.',
    coverUrl: 'https://picsum.photos/600/400?random=1',
    tags: ['Nest.js', 'React', 'PostgreSQL', 'Web Audio'],
    demoUrl: 'https://demo.brickweb.dev/soundwall',
    repoUrl: 'https://github.com/brickweb/soundwall',
    order: 1,
    isPublished: true,
  },
  {
    slug: 'prism-dashboard',
    title: 'Prism Dashboard',
    description: 'Свет раскладывается на спектр метрик в реальном времени.',
    coverUrl: 'https://picsum.photos/600/400?random=2',
    tags: ['Next.js', 'D3.js', 'WebSocket'],
    demoUrl: 'https://demo.brickweb.dev/prism-dashboard',
    repoUrl: 'https://github.com/brickweb/prism-dashboard',
    order: 2,
    isPublished: true,
  },
  {
    slug: 'bricknet',
    title: 'BrickNet',
    description: 'Стена из кирпичей-заказов, оптимизирующая логистику.',
    coverUrl: 'https://picsum.photos/600/400?random=3',
    tags: ['Nest.js', 'React', 'Docker', 'Redis'],
    demoUrl: 'https://demo.brickweb.dev/bricknet',
    repoUrl: 'https://github.com/brickweb/bricknet',
    order: 3,
    isPublished: true,
  },
  {
    slug: 'eclipse-cms',
    title: 'Eclipse CMS',
    description: 'Тёмная сторона управления контентом.',
    coverUrl: 'https://picsum.photos/600/400?random=4',
    tags: ['Nest.js', 'Next.js', 'TypeORM', 'AWS S3'],
    demoUrl: 'https://demo.brickweb.dev/eclipse-cms',
    repoUrl: 'https://github.com/brickweb/eclipse-cms',
    order: 4,
    isPublished: true,
  },
];

async function seedProjects(): Promise<void> {
  const repository = AppDataSource.getRepository(Project);

  for (const data of projects) {
    const existing = await repository.findOne({ where: { slug: data.slug } });
    const project = repository.create({ ...existing, ...data });
    await repository.save(project);
    console.log(`project ${existing ? 'updated' : 'created'}: ${data.slug}`);
  }
}

async function seed() {
  await AppDataSource.initialize();

  await seedProjects();
  await seedSkillsAndTimeline(AppDataSource);

  console.log('All seeds finished.');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
