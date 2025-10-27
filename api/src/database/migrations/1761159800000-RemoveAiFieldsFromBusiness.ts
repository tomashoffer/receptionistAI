import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAiFieldsFromBusiness1761159800000 implements MigrationInterface {
    name = 'RemoveAiFieldsFromBusiness1761159800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar los campos de AI de la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "ai_prompt"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "ai_voice_id"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "ai_language"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "vapi_assistant_id"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "vapi_public_key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar los campos de AI en la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" ADD "ai_prompt" text`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD "ai_voice_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD "ai_language" character varying(50) DEFAULT 'es-ES'`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD "vapi_assistant_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD "vapi_public_key" character varying(100)`);
    }
}
