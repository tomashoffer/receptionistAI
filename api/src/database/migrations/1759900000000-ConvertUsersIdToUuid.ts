import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUsersIdToUuid1759900000000 implements MigrationInterface {
  name = 'ConvertUsersIdToUuid1759900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si hay datos en la tabla users
    const usersCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "users"`
    );
    const count = parseInt(usersCount[0].count);

    if (count > 0) {
      console.log(`⚠️  Encontrados ${count} usuarios. Verificando si tienen IDs válidos de UUID...`);
      
      // Verificar si los IDs existentes son UUIDs válidos
      const invalidIds = await queryRunner.query(
        `SELECT id FROM "users" WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`
      );

      if (invalidIds.length > 0) {
        throw new Error(
          `❌ Error: Existen ${invalidIds.length} usuarios con IDs que no son UUIDs válidos. ` +
          `Por favor, limpia la base de datos o migra manualmente estos registros.`
        );
      }

      console.log('✅ Todos los IDs son UUIDs válidos. Procediendo con la conversión...');
    } else {
      console.log('✅ No hay usuarios en la tabla. Procediendo con la conversión...');
    }

    // Habilitar la extensión uuid-ossp si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Cambiar el tipo de columna de VARCHAR a UUID
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" TYPE uuid USING id::uuid`
    );

    // Si no hay default, agregar uno para futuros registros
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`
    );

    console.log('✅ Columna users.id convertida exitosamente a UUID');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir a VARCHAR
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`
    );
    
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" TYPE varchar USING id::varchar`
    );

    console.log('✅ Columna users.id revertida a VARCHAR');
  }
}


