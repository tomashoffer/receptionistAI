import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLog } from '../entities/call-log.entity';
import { CreateCallLogDto, UpdateCallLogDto, CallLogQueryDto } from '../dto/call-log.dto';

@Injectable()
export class CallLogService {
  constructor(
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async create(createCallLogDto: CreateCallLogDto): Promise<CallLog> {
    const callLog = this.callLogRepository.create(createCallLogDto);
    return this.callLogRepository.save(callLog);
  }

  async findAll(queryDto: CallLogQueryDto): Promise<{ data: CallLog[]; total: number; page: number; limit: number }> {
    const { business_id, status, direction, start_date, end_date, page = 1, limit = 10 } = queryDto;
    
    const queryBuilder = this.callLogRepository.createQueryBuilder('callLog')
      .leftJoinAndSelect('callLog.business', 'business')
      .where('callLog.business_id = :businessId', { businessId: business_id });

    if (status) {
      queryBuilder.andWhere('callLog.status = :status', { status });
    }

    if (direction) {
      queryBuilder.andWhere('callLog.direction = :direction', { direction });
    }

    if (start_date) {
      queryBuilder.andWhere('callLog.started_at >= :startDate', { startDate: start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('callLog.started_at <= :endDate', { endDate: end_date });
    }

    queryBuilder
      .orderBy('callLog.started_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<CallLog> {
    const callLog = await this.callLogRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!callLog) {
      throw new NotFoundException('Log de llamada no encontrado');
    }

    return callLog;
  }

  async findByCallSid(callSid: string): Promise<CallLog> {
    const callLog = await this.callLogRepository.findOne({
      where: { call_sid: callSid },
      relations: ['business'],
    });

    if (!callLog) {
      throw new NotFoundException('Log de llamada no encontrado');
    }

    return callLog;
  }

  async update(id: string, updateCallLogDto: UpdateCallLogDto): Promise<CallLog> {
    const callLog = await this.findOne(id);
    Object.assign(callLog, updateCallLogDto);
    return this.callLogRepository.save(callLog);
  }

  async updateByCallSid(callSid: string, updateCallLogDto: UpdateCallLogDto): Promise<CallLog> {
    const callLog = await this.findByCallSid(callSid);
    Object.assign(callLog, updateCallLogDto);
    return this.callLogRepository.save(callLog);
  }

  async remove(id: string): Promise<void> {
    const callLog = await this.findOne(id);
    await this.callLogRepository.remove(callLog);
  }

  async getBusinessStats(businessId: string, startDate?: string, endDate?: string): Promise<{
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    totalDuration: number;
    totalCost: number;
    averageCallDuration: number;
  }> {
    const queryBuilder = this.callLogRepository.createQueryBuilder('callLog')
      .where('callLog.business_id = :businessId', { businessId });

    if (startDate) {
      queryBuilder.andWhere('callLog.started_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('callLog.started_at <= :endDate', { endDate });
    }

    const callLogs = await queryBuilder.getMany();

    const totalCalls = callLogs.length;
    const answeredCalls = callLogs.filter(call => call.status === 'answered' || call.status === 'completed').length;
    const missedCalls = callLogs.filter(call => call.status === 'missed').length;
    const totalDuration = callLogs.reduce((sum, call) => sum + call.duration_seconds, 0);
    const totalCost = callLogs.reduce((sum, call) => sum + Number(call.cost_usd), 0);
    const averageCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    return {
      totalCalls,
      answeredCalls,
      missedCalls,
      totalDuration,
      totalCost,
      averageCallDuration,
    };
  }
}
