import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CallLogService } from '../services/call-log.service';
import { CreateCallLogDto, UpdateCallLogDto, CallLogQueryDto } from '../dto/call-log.dto';
import { CallDirection, CallStatus } from '../entities/call-log.entity';
import { Auth } from '../../../decorators/http.decorators';
import { AuthUser } from '../../../decorators/auth-user.decorator';
import { RoleType } from '../../../constants/role-type';
import { UserDto } from '../../user/dto/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('call-logs')
@ApiTags('call-logs')
export class CallLogController {
  constructor(private readonly callLogService: CallLogService) {}

  @Post()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create call log',
    description: 'Create a new call log entry'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Call log created successfully'
  })
  create(@Body() createCallLogDto: CreateCallLogDto) {
    return this.callLogService.create(createCallLogDto);
  }

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find all call logs',
    description: 'Get all call logs with optional filtering'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call logs retrieved successfully'
  })
  findAll(@Query() queryDto: CallLogQueryDto) {
    return this.callLogService.findAll(queryDto);
  }

  @Get('stats/:businessId')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get business call statistics',
    description: 'Get call statistics for a specific business (manager access required)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business statistics retrieved successfully'
  })
  getBusinessStats(
    @Param('businessId') businessId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.callLogService.getBusinessStats(businessId, startDate, endDate);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get call log by ID',
    description: 'Get a specific call log by its ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call log retrieved successfully'
  })
  findOne(@Param('id') id: string) {
    return this.callLogService.findOne(id);
  }

  @Patch(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update call log',
    description: 'Update a call log entry'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call log updated successfully'
  })
  update(@Param('id') id: string, @Body() updateCallLogDto: UpdateCallLogDto) {
    return this.callLogService.update(id, updateCallLogDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete call log',
    description: 'Delete a call log entry'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call log deleted successfully'
  })
  remove(@Param('id') id: string) {
    return this.callLogService.remove(id);
  }

  // Ruta pública para webhooks de Twilio/VAPI
  @Post('webhook')
  @Auth([], { public: true })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create call log from webhook',
    description: 'Create a call log entry from webhook data (public endpoint)'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Call log created from webhook successfully'
  })
  createFromWebhook(@Body() webhookData: any) {
    // Convertir datos del webhook a DTO
    const createCallLogDto: CreateCallLogDto = {
      business_id: webhookData.business_id,
      call_sid: webhookData.CallSid || webhookData.call_sid,
      caller_number: webhookData.From || webhookData.caller_number,
      called_number: webhookData.To || webhookData.called_number,
      direction: CallDirection.INBOUND,
      status: webhookData.status || (webhookData.CallStatus ? this.mapStatus(webhookData.CallStatus) : CallStatus.COMPLETED),
      duration_seconds: webhookData.duration_seconds || parseInt(webhookData.CallDuration || '0'),
      started_at: webhookData.started_at ? new Date(webhookData.started_at) : new Date(webhookData.Timestamp || Date.now()),
      transcription: webhookData.transcription,
      summary: webhookData.summary, // Mapeo agregado para n8n
      ai_responses: webhookData.ai_responses,
      outcome: webhookData.outcome,
      extracted_data: webhookData.extracted_data,
      cost_usd: webhookData.cost_usd || parseFloat(webhookData.cost || '0'),
      ai_tokens_used: webhookData.ai_tokens_used || parseInt(webhookData.tokens_used || '0'),
    };

    return this.callLogService.create(createCallLogDto);
  }

  // Ruta para actualizar log por CallSid (útil para webhooks)
  @Patch('by-callsid/:callSid')
  @Auth([], { public: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update call log by CallSid',
    description: 'Update a call log entry by CallSid (public endpoint for webhooks)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call log updated by CallSid successfully'
  })
  updateByCallSid(@Param('callSid') callSid: string, @Body() updateCallLogDto: UpdateCallLogDto) {
    return this.callLogService.updateByCallSid(callSid, updateCallLogDto);
  }

  private mapStatus(status: string): CallStatus {
    const statusMap: Record<string, CallStatus> = {
      'ringing': CallStatus.ANSWERED,
      'in-progress': CallStatus.ANSWERED,
      'completed': CallStatus.COMPLETED,
      'busy': CallStatus.BUSY,
      'no-answer': CallStatus.MISSED,
      'failed': CallStatus.FAILED,
      'canceled': CallStatus.MISSED,
    };
    return statusMap[status] || CallStatus.ANSWERED;
  }
}
