import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateVapiKnowledgeBaseTables1761300000001 implements MigrationInterface {
    name = 'CreateVapiKnowledgeBaseTables1761300000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tabla para tracking de files subidos a Vapi
        await queryRunner.createTable(
            new Table({
                name: 'vapi_kb_files',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'assistant_configuration_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'vapi_file_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'bytes',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'config_version',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 's3_key',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Tabla para tracking del Query Tool
        await queryRunner.createTable(
            new Table({
                name: 'vapi_query_tools',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'assistant_configuration_id',
                        type: 'uuid',
                        isNullable: false,
                        isUnique: true, // Un solo Query Tool por config
                    },
                    {
                        name: 'vapi_tool_id',
                        type: 'varchar',
                        length: '255',
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

        // Foreign Keys
        await queryRunner.createForeignKey(
            'vapi_kb_files',
            new TableForeignKey({
                columnNames: ['assistant_configuration_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'assistant_configurations',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'vapi_query_tools',
            new TableForeignKey({
                columnNames: ['assistant_configuration_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'assistant_configurations',
                onDelete: 'CASCADE',
            })
        );

        // Índices
        await queryRunner.createIndex(
            'vapi_kb_files',
            new TableIndex({
                name: 'IDX_vapi_kb_files_assistant_config',
                columnNames: ['assistant_configuration_id'],
            })
        );

        await queryRunner.createIndex(
            'vapi_kb_files',
            new TableIndex({
                name: 'IDX_vapi_kb_files_vapi_file_id',
                columnNames: ['vapi_file_id'],
            })
        );

        await queryRunner.createIndex(
            'vapi_kb_files',
            new TableIndex({
                name: 'IDX_vapi_kb_files_config_version',
                columnNames: ['config_version'],
            })
        );

        await queryRunner.createIndex(
            'vapi_kb_files',
            new TableIndex({
                name: 'IDX_vapi_kb_files_s3_key',
                columnNames: ['s3_key'],
            })
        );

        await queryRunner.createIndex(
            'vapi_query_tools',
            new TableIndex({
                name: 'IDX_vapi_query_tools_assistant_config',
                columnNames: ['assistant_configuration_id'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('vapi_query_tools');
        await queryRunner.dropTable('vapi_kb_files');
    }
}

