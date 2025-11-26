import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePaymentsTable1761300000007 implements MigrationInterface {
    name = 'CreatePaymentsTable1761300000007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla ya existe
        const paymentsTable = await queryRunner.getTable('payments');
        
        if (paymentsTable) {
            console.log('⚠️ Tabla "payments" ya existe. Saltando creación.');
            return;
        }

        // Crear la tabla payments
        await queryRunner.createTable(
            new Table({
                name: 'payments',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: true,
                    },
                    {
                        name: 'mercadopago_payment_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'mercadopago_preference_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'external_reference',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        default: "'pending'",
                    },
                    {
                        name: 'payment_method',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        default: "'ARS'",
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'mercadopago_data',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'action_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Crear foreign key a users con ON DELETE SET NULL
        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                name: 'FK_payments_user_id',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign key
        const paymentsTable = await queryRunner.getTable('payments');
        if (paymentsTable) {
            const userForeignKey = paymentsTable.foreignKeys.find(
                fk => fk.columnNames.indexOf('user_id') !== -1 && fk.referencedTableName === 'users'
            );
            if (userForeignKey) {
                await queryRunner.dropForeignKey('payments', userForeignKey);
            }
        }

        // Eliminar tabla
        await queryRunner.dropTable('payments');
    }
}

