import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact-message.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactMessage> {
    const message = this.contactRepository.create(dto);
    return this.contactRepository.save(message);
  }
}
