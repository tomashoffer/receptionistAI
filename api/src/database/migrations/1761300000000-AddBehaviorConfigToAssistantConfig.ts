import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBehaviorConfigToAssistantConfig1761300000000 implements MigrationInterface {
    name = 'AddBehaviorConfigToAssistantConfig1761300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campo behavior_config
        await queryRunner.addColumn(
            'assistant_configurations',
            new TableColumn({
                name: 'behavior_config',
                type: 'jsonb',
                isNullable: false,
                default: "'{}'::jsonb"
            })
        );

        // Campos para tracking de sync con Vapi
        await queryRunner.addColumn(
            'assistant_configurations',
            new TableColumn({
                name: 'vapi_sync_status',
                type: 'varchar',
                length: '50',
                isNullable: false,
                default: "'idle'"
            })
        );

        await queryRunner.addColumn(
            'assistant_configurations',
            new TableColumn({
                name: 'vapi_last_synced_at',
                type: 'timestamp',
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            'assistant_configurations',
            new TableColumn({
                name: 'vapi_last_error',
                type: 'text',
                isNullable: true
            })
        );

        // Índice para queries por estado de sync
        await queryRunner.query(`
            CREATE INDEX IDX_assistant_config_vapi_sync_status 
            ON assistant_configurations (vapi_sync_status);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS IDX_assistant_config_vapi_sync_status;`);
        await queryRunner.dropColumn('assistant_configurations', 'vapi_last_error');
        await queryRunner.dropColumn('assistant_configurations', 'vapi_last_synced_at');
        await queryRunner.dropColumn('assistant_configurations', 'vapi_sync_status');
        await queryRunner.dropColumn('assistant_configurations', 'behavior_config');
    }
}

