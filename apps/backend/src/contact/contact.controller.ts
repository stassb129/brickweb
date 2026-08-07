import { Body, Controller, Post } from '@nestjs/common';
import { ContactMessage } from './contact-message.entity';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() dto: CreateContactDto): Promise<ContactMessage> {
    return this.contactService.create(dto);
  }
}
