import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { ContactTag } from './entities/contact-tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ContactTag)
    private readonly contactTagRepository: Repository<ContactTag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // Verificar si ya existe un tag con ese nombre en el business
    const existing = await this.tagRepository.findOne({
      where: {
        business_id: createTagDto.business_id,
        label: createTagDto.label,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una etiqueta con este nombre en este negocio',
      );
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAllByBusiness(businessId: string): Promise<Tag[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.contactTags', 'contactTags')
      .where('tag.business_id = :businessId', { businessId })
      .loadRelationCountAndMap('tag.contactCount', 'tag.contactTags')
      .orderBy('tag.created_at', 'DESC')
      .getMany();

    return tags;
  }

  async findOne(id: string, businessId: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, business_id: businessId },
    });

    if (!tag) {
      throw new NotFoundException(
        `Etiqueta con ID ${id} no encontrada en este negocio`,
      );
    }

    return tag;
  }

  async update(
    id: string,
    businessId: string,
    updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    const tag = await this.findOne(id, businessId);

    // Si cambia el label, verificar que no exista otro con ese nombre
    if (updateTagDto.label && updateTagDto.label !== tag.label) {
      const existing = await this.tagRepository.findOne({
        where: {
          business_id: businessId,
          label: updateTagDto.label,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Ya existe una etiqueta con este nombre en este negocio',
        );
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const tag = await this.findOne(id, businessId);
    // Las relaciones ContactTag se eliminan en cascada
    await this.tagRepository.remove(tag);
  }

  // ========== CONTACT TAGS ==========

  async getContactTags(contactId: string): Promise<Tag[]> {
    const contactTags = await this.contactTagRepository.find({
      where: { contact_id: contactId },
      relations: ['tag'],
    });

    return contactTags.map((ct) => ct.tag);
  }

  async assignTagsToContact(
    contactId: string,
    assignTagsDto: AssignTagsDto,
  ): Promise<Tag[]> {
    const { tag_ids, assigned_by } = assignTagsDto;

    // Eliminar tags duplicados
    const uniqueTagIds = [...new Set(tag_ids)];

    for (const tagId of uniqueTagIds) {
      // Verificar si ya existe la relación
      const existing = await this.contactTagRepository.findOne({
        where: { contact_id: contactId, tag_id: tagId },
      });

      if (!existing) {
        const contactTag = this.contactTagRepository.create({
          contact_id: contactId,
          tag_id: tagId,
          assigned_by,
        });
        await this.contactTagRepository.save(contactTag);
      }
    }

    return await this.getContactTags(contactId);
  }

  async removeTagFromContact(contactId: string, tagId: string): Promise<void> {
    const contactTag = await this.contactTagRepository.findOne({
      where: { contact_id: contactId, tag_id: tagId },
    });

    if (contactTag) {
      await this.contactTagRepository.remove(contactTag);
    }
  }

  // Asignar tag por label (para VAPI - auto-assign)
  async findOrCreateTagByLabel(
    businessId: string,
    label: string,
    color: string = 'blue',
    icon?: string,
  ): Promise<Tag> {
    let tag = await this.tagRepository.findOne({
      where: { business_id: businessId, label },
    });

    if (!tag) {
      tag = this.tagRepository.create({
        business_id: businessId,
        label,
        color,
        icon,
      });
      await this.tagRepository.save(tag);
      console.log(`✅ Tag auto-creado: ${label}`);
    }

    return tag;
  }

  async assignTagToContactByLabel(
    contactId: string,
    businessId: string,
    label: string,
    color: string = 'blue',
    icon?: string,
  ): Promise<void> {
    const tag = await this.findOrCreateTagByLabel(
      businessId,
      label,
      color,
      icon,
    );

    await this.assignTagsToContact(contactId, {
      tag_ids: [tag.id],
    });
  }
}

