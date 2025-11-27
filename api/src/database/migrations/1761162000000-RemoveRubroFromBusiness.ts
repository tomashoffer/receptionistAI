import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRubroFromBusiness1761162000000 implements MigrationInterface {
    name = 'RemoveRubroFromBusiness1761162000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna rubro de la tabla businesses
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "rubro"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar columna rubro si es necesario hacer rollback
        await queryRunner.query(`ALTER TABLE "businesses" ADD "rubro" character varying(255)`);
    }
}

