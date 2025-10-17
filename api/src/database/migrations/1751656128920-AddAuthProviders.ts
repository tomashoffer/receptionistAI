import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAuthProviders1751656128920 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "auth_provider", 
            type: "enum",
            enum: ["LOCAL", "GOOGLE"],
            default: "'LOCAL'",
            isNullable: true
          }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "authProvider");
    }

}