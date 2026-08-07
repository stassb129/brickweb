import { DataSource, DataSourceOptions } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Skill } from '../skills/skill.entity';
import { TimelineEvent } from '../timeline/timeline-event.entity';
import { ContactMessage } from '../contact/contact-message.entity';

const entities = [Project, Skill, TimelineEvent, ContactMessage];

function buildDatabaseConfig(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities,
      synchronize: process.env.TYPEORM_SYNC === 'true',
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'brickweb',
    entities,
    synchronize: true,
  };
}

export const databaseConfig: DataSourceOptions = buildDatabaseConfig();

export const AppDataSource = new DataSource(databaseConfig);
