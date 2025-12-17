import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddContactIdToAppointments1733360400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna contact_id a appointments
    await queryRunner.addColumn(
      'appointments',
      new TableColumn({
        name: 'contact_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Crear foreign key hacia contacts (opcional, puede ser null para appointments legacy)
    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'SET NULL', // Si se elimina el contacto, no eliminar el appointment
      }),
    );

    console.log('✅ Columna contact_id agregada a appointments');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key primero
    const table = await queryRunner.getTable('appointments');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('contact_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('appointments', foreignKey);
    }

    // Eliminar columna
    await queryRunner.dropColumn('appointments', 'contact_id');

    console.log('✅ Columna contact_id eliminada de appointments');
  }
}



