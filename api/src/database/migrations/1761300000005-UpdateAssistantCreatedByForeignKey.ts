import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAssistantCreatedByForeignKey1761300000005 implements MigrationInterface {
    name = 'UpdateAssistantCreatedByForeignKey1761300000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ===== ASSISTANTS TABLE =====
        // Primero, hacer que la columna created_by sea nullable
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            ALTER COLUMN "created_by" DROP NOT NULL;
        `);

        // Eliminar la constraint existente
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            DROP CONSTRAINT IF EXISTS "FK_assistants_created_by";
        `);

        // Crear la nueva constraint con ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            ADD CONSTRAINT "FK_assistants_created_by" 
            FOREIGN KEY ("created_by") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL;
        `);

        // ===== ASSISTANT_CONFIGURATIONS TABLE =====
        // Primero, hacer que la columna created_by sea nullable
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            ALTER COLUMN "created_by" DROP NOT NULL;
        `);

        // Eliminar la constraint existente (si existe)
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            DROP CONSTRAINT IF EXISTS "FK_assistant_configurations_created_by";
        `);

        // Crear la nueva constraint con ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            ADD CONSTRAINT "FK_assistant_configurations_created_by" 
            FOREIGN KEY ("created_by") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ===== ASSISTANT_CONFIGURATIONS TABLE =====
        // Eliminar la constraint
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            DROP CONSTRAINT IF EXISTS "FK_assistant_configurations_created_by";
        `);

        // Recrear la constraint original sin ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            ADD CONSTRAINT "FK_assistant_configurations_created_by" 
            FOREIGN KEY ("created_by") 
            REFERENCES "users"("id");
        `);

        // Hacer que la columna created_by sea NOT NULL nuevamente
        // Nota: Esto fallará si hay valores NULL, así que primero necesitaríamos actualizar esos valores
        await queryRunner.query(`
            ALTER TABLE "assistant_configurations" 
            ALTER COLUMN "created_by" SET NOT NULL;
        `);

        // ===== ASSISTANTS TABLE =====
        // Eliminar la constraint
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            DROP CONSTRAINT IF EXISTS "FK_assistants_created_by";
        `);

        // Recrear la constraint original sin ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            ADD CONSTRAINT "FK_assistants_created_by" 
            FOREIGN KEY ("created_by") 
            REFERENCES "users"("id");
        `);

        // Hacer que la columna created_by sea NOT NULL nuevamente
        // Nota: Esto fallará si hay valores NULL, así que primero necesitaríamos actualizar esos valores
        await queryRunner.query(`
            ALTER TABLE "assistants" 
            ALTER COLUMN "created_by" SET NOT NULL;
        `);
    }
}

