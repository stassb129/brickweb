import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedSkillsAndTimeline } from './skills-timeline-data';

async function seed() {
  await AppDataSource.initialize();
  await seedSkillsAndTimeline(AppDataSource);
  console.log('skills-timeline seed finished.');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
