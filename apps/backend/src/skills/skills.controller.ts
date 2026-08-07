import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Skill } from './skill.entity';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Skill> {
    return this.skillsService.findOne(id);
  }
}
