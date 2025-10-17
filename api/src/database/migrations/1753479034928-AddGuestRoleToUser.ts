import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestRoleToUser1753479034928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(`
      SELECT 1 FROM pg_enum
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'users_role_enum'
      ) AND enumlabel = 'GUEST'
    `);

    // This prevents the "enum label already exists" error.
    if (result.length === 0) {
      await queryRunner.query(
        `ALTER TYPE "public"."users_role_enum" ADD VALUE 'GUEST'`,
      );
    } else {
      // Log a message for clarity during development or deployment.
      console.log("Migration 'AddGuestRoleToUser': 'GUEST' role already exists, skipping.");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No se puede eliminar un valor de un tipo enum en PostgreSQL
    // Podrías considerar cambiar los roles de 'GUEST' a otro valor antes de revertir
  }
}
