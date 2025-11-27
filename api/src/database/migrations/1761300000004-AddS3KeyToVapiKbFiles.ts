import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddS3KeyToVapiKbFiles1761300000004 implements MigrationInterface {
    name = 'AddS3KeyToVapiKbFiles1761300000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna s3_key a vapi_kb_files
        await queryRunner.addColumn(
            'vapi_kb_files',
            new TableColumn({
                name: 's3_key',
                type: 'varchar',
                length: '500',
                isNullable: true,
            })
        );

        // Crear índice para s3_key si no existe
        const table = await queryRunner.getTable('vapi_kb_files');
        const s3KeyIndex = table?.indices.find(idx => idx.columnNames.includes('s3_key'));
        
        if (!s3KeyIndex) {
            await queryRunner.createIndex(
                'vapi_kb_files',
                new TableIndex({
                    name: 'IDX_vapi_kb_files_s3_key',
                    columnNames: ['s3_key'],
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índice
        await queryRunner.dropIndex('vapi_kb_files', 'IDX_vapi_kb_files_s3_key');
        
        // Eliminar columna
        await queryRunner.dropColumn('vapi_kb_files', 's3_key');
    }
}

