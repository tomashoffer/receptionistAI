import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssistantConfigService } from './assistant-config.service';
import { CreateAssistantConfigDto, UpdateAssistantConfigDto } from './dto/assistant-config.dto';
import { Auth } from '../../decorators/http.decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { RoleType } from '../../constants/role-type';
import { UserDto } from '../user/dto/user.dto';
import { AssistantConfiguration } from './entities/assistant-configuration.entity';

@Controller('assistant-configs')
@ApiTags('assistant-configs')
@ApiBearerAuth()
export class AssistantConfigController {
  constructor(
    private readonly assistantConfigService: AssistantConfigService,
  ) {}

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create assistant configuration' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully', type: AssistantConfiguration })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  async create(
    @Body() createDto: CreateAssistantConfigDto,
    @AuthUser() user: UserDto,
  ): Promise<AssistantConfiguration> {
    return await this.assistantConfigService.create(createDto, user.id);
  }

  @Get('business/:businessId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Get configuration by business ID' })
  @ApiResponse({ status: 200, description: 'Configuration found', type: AssistantConfiguration })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async findByBusinessId(
    @Param('businessId') businessId: string,
  ): Promise<AssistantConfiguration | null> {
    return await this.assistantConfigService.findByBusinessId(businessId);
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Get configuration by ID' })
  @ApiResponse({ status: 200, description: 'Configuration found', type: AssistantConfiguration })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async findOne(@Param('id') id: string): Promise<AssistantConfiguration> {
    return await this.assistantConfigService.findOne(id);
  }

  @Patch(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Update assistant configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully', type: AssistantConfiguration })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssistantConfigDto,
    @AuthUser() user: UserDto,
  ): Promise<AssistantConfiguration> {
    return await this.assistantConfigService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete assistant configuration' })
  @ApiResponse({ status: 204, description: 'Configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.assistantConfigService.delete(id);
  }
}

