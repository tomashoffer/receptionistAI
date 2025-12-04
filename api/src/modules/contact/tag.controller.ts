import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../../guards/auth-strategy.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagService.create(createTagDto);
  }

  @Get()
  async findAll(@Query('business_id') businessId: string) {
    return await this.tagService.findAllByBusiness(businessId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
  ) {
    return await this.tagService.findOne(id, businessId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return await this.tagService.update(id, businessId, updateTagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
  ) {
    await this.tagService.remove(id, businessId);
  }
}

