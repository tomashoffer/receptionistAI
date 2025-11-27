import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { VapiKnowledgeBaseSyncService } from '../services/vapi-knowledge-base-sync.service';
import { Logger } from '@nestjs/common';

@Processor('knowledge-base-sync')
export class KnowledgeBaseSyncProcessor {
  private readonly logger = new Logger(KnowledgeBaseSyncProcessor.name);

  constructor(
    private syncService: VapiKnowledgeBaseSyncService,
  ) {}

  @Process('sync')
  async handleSync(job: Job<{ assistantConfigId: string }>) {
    const { assistantConfigId } = job.data;
    this.logger.log(`Procesando sync de knowledge base para ${assistantConfigId}`);
    
    try {
      await this.syncService.syncKnowledgeBase(assistantConfigId);
      this.logger.log(`Sync completado para ${assistantConfigId}`);
    } catch (error) {
      this.logger.error(`Error en sync: ${error.message}`, error.stack);
      throw error; // Bull reintentará automáticamente
    }
  }
}

