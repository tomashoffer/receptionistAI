import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddSummaryAndContactIdToCallLogs1733400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna summary
    await queryRunner.addColumn(
      'call_logs',
      new TableColumn({
        name: 'summary',
        type: 'text',
        isNullable: true,
      }),
    );

    // Agregar columna contact_id
    await queryRunner.addColumn(
      'call_logs',
      new TableColumn({
        name: 'contact_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Crear foreign key hacia contacts (opcional)
    await queryRunner.createForeignKey(
      'call_logs',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'SET NULL', // Si se elimina el contacto, no eliminar el call log
      }),
    );

    console.log('✅ Columnas summary y contact_id agregadas a call_logs');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key primero
    const table = await queryRunner.getTable('call_logs');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('contact_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('call_logs', foreignKey);
    }

    // Eliminar columnas
    await queryRunner.dropColumn('call_logs', 'contact_id');
    await queryRunner.dropColumn('call_logs', 'summary');

    console.log('✅ Columnas summary y contact_id eliminadas de call_logs');
  }
}

