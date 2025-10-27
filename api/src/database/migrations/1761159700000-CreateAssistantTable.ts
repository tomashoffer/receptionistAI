import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssistantTable1761159700000 implements MigrationInterface {
    name = 'CreateAssistantTable1761159700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear los enums necesarios
        await queryRunner.query(`CREATE TYPE "public"."assistants_voice_provider_enum" AS ENUM('vapi', 'elevenlabs', 'azure')`);
        await queryRunner.query(`CREATE TYPE "public"."assistants_model_provider_enum" AS ENUM('openai', 'anthropic', 'google')`);
        await queryRunner.query(`CREATE TYPE "public"."assistants_status_enum" AS ENUM('active', 'inactive', 'draft')`);
        
        // Crear la tabla assistants
        await queryRunner.query(`CREATE TABLE "assistants" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "business_id" uuid NOT NULL, 
            "name" character varying(255) NOT NULL, 
            "prompt" text NOT NULL, 
            "first_message" character varying(500), 
            "vapi_assistant_id" character varying(100), 
            "vapi_public_key" character varying(100), 
            "voice_id" character varying(100) NOT NULL, 
            "voice_provider" "public"."assistants_voice_provider_enum" NOT NULL DEFAULT 'azure', 
            "language" character varying(10) NOT NULL DEFAULT 'es-ES', 
            "model_provider" "public"."assistants_model_provider_enum" NOT NULL DEFAULT 'openai', 
            "model_name" character varying(50) NOT NULL DEFAULT 'gpt-4o-mini', 
            "tools" json, 
            "required_fields" json, 
            "server_url" character varying(500), 
            "server_url_secret" character varying(255), 
            "status" "public"."assistants_status_enum" NOT NULL DEFAULT 'draft', 
            "created_by" uuid NOT NULL, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_assistants_business_id" UNIQUE ("business_id"), 
            CONSTRAINT "PK_assistants_id" PRIMARY KEY ("id")
        )`);
        
        // Agregar foreign keys
        await queryRunner.query(`ALTER TABLE "assistants" ADD CONSTRAINT "FK_assistants_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assistants" ADD CONSTRAINT "FK_assistants_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`ALTER TABLE "assistants" DROP CONSTRAINT "FK_assistants_created_by"`);
        await queryRunner.query(`ALTER TABLE "assistants" DROP CONSTRAINT "FK_assistants_business_id"`);
        
        // Eliminar tabla
        await queryRunner.query(`DROP TABLE "assistants"`);
        
        // Eliminar enums
        await queryRunner.query(`DROP TYPE "public"."assistants_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assistants_model_provider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assistants_voice_provider_enum"`);
    }
}
