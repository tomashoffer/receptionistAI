import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateBusinessTables1700000000000 implements MigrationInterface {
  name = 'CreateBusinessTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla business_plans primero (referenciada por businesses)
    await queryRunner.createTable(
      new Table({
        name: 'business_plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'price_monthly',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'call_minutes_limit',
            type: 'int',
            default: 0,
          },
          {
            name: 'integrations_limit',
            type: 'int',
            default: 1,
          },
          {
            name: 'users_limit',
            type: 'int',
            default: 1,
          },
          {
            name: 'features',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    // Crear tabla businesses
    await queryRunner.createTable(
      new Table({
        name: 'businesses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'owner_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'industry',
            type: 'enum',
            enum: [
              'hair_salon',
              'restaurant',
              'medical_clinic',
              'dental_clinic',
              'fitness_center',
              'beauty_salon',
              'law_firm',
              'consulting',
              'real_estate',
              'automotive',
              'other',
            ],
            default: "'other'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'trial'],
            default: "'trial'",
          },
          {
            name: 'ai_prompt',
            type: 'text',
          },
          {
            name: 'ai_voice_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'ai_language',
            type: 'varchar',
            length: '50',
            default: "'es-ES'",
          },
          {
            name: 'business_hours',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'services',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'google_calendar_config',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'google_drive_config',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'twilio_phone_sid',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'twilio_webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'vapi_assistant_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'vapi_public_key',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'plan_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'trial_ends_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'subscription_ends_at',
            type: 'timestamp',
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

    // Crear tabla business_users
    await queryRunner.createTable(
      new Table({
        name: 'business_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['owner', 'admin', 'manager', 'staff'],
            default: "'staff'",
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
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

    // Crear tabla call_logs
    await queryRunner.createTable(
      new Table({
        name: 'call_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
          },
          {
            name: 'call_sid',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'caller_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'called_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'direction',
            type: 'enum',
            enum: ['inbound', 'outbound'],
            default: "'inbound'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['answered', 'missed', 'busy', 'failed', 'completed'],
            default: "'answered'",
          },
          {
            name: 'duration_seconds',
            type: 'int',
            default: 0,
          },
          {
            name: 'started_at',
            type: 'timestamp',
          },
          {
            name: 'ended_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'transcription',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ai_responses',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'sentiment',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'sentiment_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'outcome',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'extracted_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'cost_usd',
            type: 'decimal',
            precision: 10,
            scale: 4,
            default: 0,
          },
          {
            name: 'ai_tokens_used',
            type: 'int',
            default: 0,
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

    // Crear índices para optimizar consultas
    await queryRunner.createIndex('businesses', new TableIndex({
      name: 'IDX_BUSINESSES_PHONE_NUMBER',
      columnNames: ['phone_number']
    }));
    await queryRunner.createIndex('businesses', new TableIndex({
      name: 'IDX_BUSINESSES_OWNER_ID',
      columnNames: ['owner_id']
    }));
    await queryRunner.createIndex('business_users', new TableIndex({
      name: 'IDX_BUSINESS_USERS_BUSINESS_ID',
      columnNames: ['business_id']
    }));
    await queryRunner.createIndex('business_users', new TableIndex({
      name: 'IDX_BUSINESS_USERS_USER_ID',
      columnNames: ['user_id']
    }));
    await queryRunner.createIndex('call_logs', new TableIndex({
      name: 'IDX_CALL_LOGS_BUSINESS_ID',
      columnNames: ['business_id']
    }));
    await queryRunner.createIndex('call_logs', new TableIndex({
      name: 'IDX_CALL_LOGS_CALL_SID',
      columnNames: ['call_sid']
    }));
    await queryRunner.createIndex('call_logs', new TableIndex({
      name: 'IDX_CALL_LOGS_STARTED_AT',
      columnNames: ['started_at']
    }));

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'businesses',
      new TableForeignKey({
        columnNames: ['plan_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'business_plans',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'business_users',
      new TableForeignKey({
        columnNames: ['business_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'businesses',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'call_logs',
      new TableForeignKey({
        columnNames: ['business_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'businesses',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    const callLogsTable = await queryRunner.getTable('call_logs');
    const callLogsForeignKey = callLogsTable.foreignKeys.find(fk => fk.columnNames.indexOf('business_id') !== -1);
    if (callLogsForeignKey) {
      await queryRunner.dropForeignKey('call_logs', callLogsForeignKey);
    }

    const businessUsersTable = await queryRunner.getTable('business_users');
    const businessUsersForeignKey = businessUsersTable.foreignKeys.find(fk => fk.columnNames.indexOf('business_id') !== -1);
    if (businessUsersForeignKey) {
      await queryRunner.dropForeignKey('business_users', businessUsersForeignKey);
    }

    const businessesTable = await queryRunner.getTable('businesses');
    const businessesForeignKey = businessesTable.foreignKeys.find(fk => fk.columnNames.indexOf('plan_id') !== -1);
    if (businessesForeignKey) {
      await queryRunner.dropForeignKey('businesses', businessesForeignKey);
    }

    // Eliminar índices
    await queryRunner.dropIndex('call_logs', 'IDX_CALL_LOGS_STARTED_AT');
    await queryRunner.dropIndex('call_logs', 'IDX_CALL_LOGS_CALL_SID');
    await queryRunner.dropIndex('call_logs', 'IDX_CALL_LOGS_BUSINESS_ID');
    await queryRunner.dropIndex('business_users', 'IDX_BUSINESS_USERS_USER_ID');
    await queryRunner.dropIndex('business_users', 'IDX_BUSINESS_USERS_BUSINESS_ID');
    await queryRunner.dropIndex('businesses', 'IDX_BUSINESSES_OWNER_ID');
    await queryRunner.dropIndex('businesses', 'IDX_BUSINESSES_PHONE_NUMBER');

    // Eliminar tablas
    await queryRunner.dropTable('call_logs');
    await queryRunner.dropTable('business_users');
    await queryRunner.dropTable('businesses');
    await queryRunner.dropTable('business_plans');
  }
}
