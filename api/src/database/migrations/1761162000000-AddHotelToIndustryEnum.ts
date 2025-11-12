import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHotelToIndustryEnum1761162000000 implements MigrationInterface {
    name = 'AddHotelToIndustryEnum1761162000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar 'hotel' al enum businesses_industry_enum antes de 'other'
        await queryRunner.query(`
            ALTER TYPE "businesses_industry_enum" ADD VALUE IF NOT EXISTS 'hotel'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // PostgreSQL no permite eliminar valores de un enum directamente
        // Se necesitaría recrear el enum completo, lo cual es complejo
        // Por lo tanto, dejamos esta migración sin rollback
        console.log('Cannot remove enum value. Migration cannot be reverted.');
    }
}

