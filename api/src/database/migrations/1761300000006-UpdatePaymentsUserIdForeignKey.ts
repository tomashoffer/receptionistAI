import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentsUserIdForeignKey1761300000006 implements MigrationInterface {
    name = 'UpdatePaymentsUserIdForeignKey1761300000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla payments existe
        const paymentsTable = await queryRunner.getTable('payments');
        
        if (!paymentsTable) {
            // La tabla no existe, saltar esta migración
            console.log('⚠️ Tabla "payments" no existe. Saltando migración de foreign key.');
            return;
        }

        // Primero, hacer que la columna user_id sea nullable
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ALTER COLUMN "user_id" DROP NOT NULL;
        `);

        // Eliminar la constraint existente (si existe)
        await queryRunner.query(`
            ALTER TABLE "payments" 
            DROP CONSTRAINT IF EXISTS "FK_payments_user_id";
        `);

        // Buscar y eliminar cualquier constraint que referencie user_id
        const updatedPaymentsTable = await queryRunner.getTable('payments');
        if (updatedPaymentsTable) {
            const userForeignKey = updatedPaymentsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf('user_id') !== -1 && fk.referencedTableName === 'users'
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey('payments', userForeignKey);
            }
        }

        // Crear la nueva constraint con ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_user_id" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla payments existe
        const paymentsTable = await queryRunner.getTable('payments');
        
        if (!paymentsTable) {
            // La tabla no existe, saltar esta migración
            console.log('⚠️ Tabla "payments" no existe. Saltando reversión de migración.');
            return;
        }

        // Eliminar la constraint
        await queryRunner.query(`
            ALTER TABLE "payments" 
            DROP CONSTRAINT IF EXISTS "FK_payments_user_id";
        `);

        // Buscar y eliminar cualquier constraint que referencie user_id
        const updatedPaymentsTable = await queryRunner.getTable('payments');
        if (updatedPaymentsTable) {
            const userForeignKey = updatedPaymentsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf('user_id') !== -1 && fk.referencedTableName === 'users'
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey('payments', userForeignKey);
            }
        }

        // Recrear la constraint original con ON DELETE CASCADE
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_user_id" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE;
        `);

        // Hacer que la columna user_id sea NOT NULL nuevamente
        // Nota: Esto fallará si hay valores NULL, así que primero necesitaríamos actualizar esos valores
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ALTER COLUMN "user_id" SET NOT NULL;
        `);
    }
}

