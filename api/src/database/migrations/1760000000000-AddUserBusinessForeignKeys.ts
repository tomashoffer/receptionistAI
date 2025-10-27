import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddUserBusinessForeignKeys1760000000000 implements MigrationInterface {
  name = 'AddUserBusinessForeignKeys1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar foreign key de businesses.owner_id -> users.id
    await queryRunner.createForeignKey(
      'businesses',
      new TableForeignKey({
        name: 'FK_BUSINESSES_OWNER_ID',
        columnNames: ['owner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Agregar foreign key de business_users.user_id -> users.id
    await queryRunner.createForeignKey(
      'business_users',
      new TableForeignKey({
        name: 'FK_BUSINESS_USERS_USER_ID',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key de business_users.user_id
    const businessUsersTable = await queryRunner.getTable('business_users');
    const businessUsersUserForeignKey = businessUsersTable?.foreignKeys.find(
      fk => fk.columnNames.indexOf('user_id') !== -1 && fk.referencedTableName === 'users'
    );
    if (businessUsersUserForeignKey) {
      await queryRunner.dropForeignKey('business_users', businessUsersUserForeignKey);
    }

    // Eliminar foreign key de businesses.owner_id
    const businessesTable = await queryRunner.getTable('businesses');
    const businessesOwnerForeignKey = businessesTable?.foreignKeys.find(
      fk => fk.columnNames.indexOf('owner_id') !== -1 && fk.referencedTableName === 'users'
    );
    if (businessesOwnerForeignKey) {
      await queryRunner.dropForeignKey('businesses', businessesOwnerForeignKey);
    }
  }
}


