import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateAssistantConfigurationTable1761200000000 implements MigrationInterface {
    name = 'CreateAssistantConfigurationTable1761200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'assistant_configurations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'business_id',
                        type: 'uuid',
                        isNullable: false,
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
                            'hotel',
                            'other'
                        ],
                        isNullable: false,
                    },
                    {
                        name: 'prompt',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'config_data',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'version',
                        type: 'integer',
                        default: 1,
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: false,
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
                    },
                ],
            }),
            true
        );

        // Foreign keys
        await queryRunner.createForeignKey(
            'assistant_configurations',
            new TableForeignKey({
                columnNames: ['business_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'businesses',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'assistant_configurations',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        // Indexes
        await queryRunner.createIndex(
            'assistant_configurations',
            new TableIndex({
                name: 'IDX_assistant_config_business_id',
                columnNames: ['business_id'],
            })
        );

        await queryRunner.createIndex(
            'assistant_configurations',
            new TableIndex({
                name: 'IDX_assistant_config_industry',
                columnNames: ['industry'],
            })
        );

        // GIN index para JSONB queries
        await queryRunner.query(`
            CREATE INDEX IDX_assistant_config_data ON assistant_configurations USING GIN (config_data);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('assistant_configurations');
    }
}

