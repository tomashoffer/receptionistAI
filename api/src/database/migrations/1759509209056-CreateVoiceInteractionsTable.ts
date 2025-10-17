import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVoiceInteractionsTable1759509209056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'voice_interactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'transcription',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'intent',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'response',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'confidence',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'appointment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'intent_type',
            type: 'enum',
            enum: ['greeting', 'schedule', 'cancel', 'query', 'goodbye', 'help', 'unknown'],
            default: "'greeting'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'success'",
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'audio_file_path',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'processing_time_ms',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('voice_interactions');
  }
}

