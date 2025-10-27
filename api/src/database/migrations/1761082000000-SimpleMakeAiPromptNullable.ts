import { MigrationInterface, QueryRunner } from "typeorm";

export class SimpleMakeAiPromptNullable1761082000000 implements MigrationInterface {
    name = 'SimpleMakeAiPromptNullable1761082000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "ai_prompt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "ai_prompt" SET NOT NULL`);
    }
}
