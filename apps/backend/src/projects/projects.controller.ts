import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string): Promise<Project> {
    const project = await this.projectsService.findOneBySlug(slug);

    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }

    return project;
  }
}
