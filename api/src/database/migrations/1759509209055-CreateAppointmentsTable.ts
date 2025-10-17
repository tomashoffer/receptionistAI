import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAppointmentsTable1759509209055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'client_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'client_phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'client_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'service_type',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'appointment_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'appointment_time',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
            default: "'pending'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'google_calendar_event_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'google_sheets_row_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'voice_interaction_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
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
    await queryRunner.dropTable('appointments');
  }
}

