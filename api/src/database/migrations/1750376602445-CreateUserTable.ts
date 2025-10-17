import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { RoleType } from '../../constants/role-type';

export class CreateUserTable1750376602445 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    isPrimary: true,
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: Object.values(RoleType),
                    default: `'${RoleType.USER}'`
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: true
                },
                {
                    name: 'password',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'temporary_password',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'verification_token',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'reset_password_token',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'reset_password_expires_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'password_changed_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()'
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }

}