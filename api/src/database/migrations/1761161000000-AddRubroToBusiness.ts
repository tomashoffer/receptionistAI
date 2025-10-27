import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRubroToBusiness1761161000000 implements MigrationInterface {
    name = 'AddRubroToBusiness1761161000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna rubro a la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" ADD "rubro" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna rubro de la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "rubro"`);
    }
}
