import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVapiSchemaTypeToAssistantConfiguration1764267104231 implements MigrationInterface {
  name = 'AddVapiSchemaTypeToAssistantConfiguration1764267104231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "assistant_configurations" 
      ADD COLUMN "vapi_schema_type" VARCHAR(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "assistant_configurations" 
      DROP COLUMN "vapi_schema_type"
    `);
  }
}

