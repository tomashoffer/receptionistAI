import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { TagService } from './tag.service';
import { ContactImportService } from './contact-import.service';
import { ContactController } from './contact.controller';
import { TagController } from './tag.controller';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { ContactTag } from './entities/contact-tag.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, Tag, ContactTag, AppointmentEntity])],
  controllers: [ContactController, TagController],
  providers: [ContactService, TagService, ContactImportService],
  exports: [ContactService, TagService, ContactImportService],
})
export class ContactModule {}

