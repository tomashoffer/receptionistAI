import { 
  Controller, 
  Get, 
  Post, 
  Body,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TestAssistantService } from './test-assistant.service';
import { Auth } from '../../decorators/http.decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { RoleType } from '../../constants/role-type';
import { UserDto } from '../user/dto/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('test-assistant')
@ApiTags('test-assistant')
export class TestAssistantController {
  constructor(private testAssistantService: TestAssistantService) {}

  @Get('config')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get test assistant configuration',
    description: 'Get the test assistant configuration for the current business'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test assistant configuration retrieved successfully'
  })
  async getConfig(@AuthUser() user: UserDto) {
    // TODO: Implementar lógica para obtener business_id del usuario
    return this.testAssistantService.getBusinessConfig('default-business-id');
  }

  @Post('config')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update test assistant configuration',
    description: 'Update the test assistant configuration for the current business'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test assistant configuration updated successfully'
  })
  async updateConfig(@Body() config: any, @AuthUser() user: UserDto) {
    // TODO: Implementar lógica para obtener business_id del usuario
    return this.testAssistantService.updateBusinessConfig('default-business-id', config);
  }

  @Post('test-call')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create test call',
    description: 'Create a new test call log entry'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Test call created successfully'
  })
  async createTestCall(@Body() testData: any, @AuthUser() user: UserDto) {
    // TODO: Implementar lógica para obtener business_id del usuario
    return this.testAssistantService.createTestCallLog('default-business-id', testData);
  }

  @Get('test-calls')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get test calls',
    description: 'Get all test call logs for the current business'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test calls retrieved successfully'
  })
  async getTestCalls(@AuthUser() user: UserDto) {
    // TODO: Implementar lógica para obtener business_id del usuario
    return this.testAssistantService.getTestCallLogs('default-business-id');
  }
}
