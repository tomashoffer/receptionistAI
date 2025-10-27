import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssistantIdToBusiness1761160000000 implements MigrationInterface {
    name = 'AddAssistantIdToBusiness1761160000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar assistant_id a la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" ADD "assistant_id" uuid`);
        
        // Agregar foreign key constraint
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_businesses_assistant_id" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE SET NULL`);
        
        // Migrar datos existentes: crear assistant_id basado en la relación existente
        await queryRunner.query(`
            UPDATE "businesses" 
            SET "assistant_id" = (
                SELECT "assistants"."id" 
                FROM "assistants" 
                WHERE "assistants"."business_id" = "businesses"."id"
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign key constraint
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT IF EXISTS "FK_businesses_assistant_id"`);
        
        // Eliminar columna assistant_id
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "assistant_id"`);
    }
}
