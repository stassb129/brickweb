import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  findAll(): Promise<Skill[]> {
    return this.skillsRepository.find({
      order: { level: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill #${id} not found`);
    }
    return skill;
  }
}
