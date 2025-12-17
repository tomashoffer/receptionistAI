import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateContactsTables1733356800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla contacts
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'enum',
            enum: ['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'],
            default: "'manual'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'total_interactions',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'last_interaction',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_conversation_summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'conversation_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key: business_id -> businesses
    await queryRunner.createForeignKey(
      'contacts',
      new TableForeignKey({
        columnNames: ['business_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'businesses',
        onDelete: 'CASCADE',
      }),
    );

    // Índice único: business_id + phone (no duplicar contactos en el mismo business)
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'IDX_CONTACTS_BUSINESS_PHONE',
        columnNames: ['business_id', 'phone'],
        isUnique: true,
      }),
    );

    // Índice para búsqueda por last_interaction
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'IDX_CONTACTS_LAST_INTERACTION',
        columnNames: ['last_interaction'],
      }),
    );

    // Crear tabla tags
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'label',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '20',
            default: "'blue'",
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key: business_id -> businesses
    await queryRunner.createForeignKey(
      'tags',
      new TableForeignKey({
        columnNames: ['business_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'businesses',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key: created_by -> users
    await queryRunner.createForeignKey(
      'tags',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Índice único: business_id + label (no duplicar tags en el mismo business)
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_TAGS_BUSINESS_LABEL',
        columnNames: ['business_id', 'label'],
        isUnique: true,
      }),
    );

    // Crear tabla contact_tags (relación N-a-N)
    await queryRunner.createTable(
      new Table({
        name: 'contact_tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'contact_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'tag_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key: contact_id -> contacts
    await queryRunner.createForeignKey(
      'contact_tags',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key: tag_id -> tags
    await queryRunner.createForeignKey(
      'contact_tags',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key: assigned_by -> users
    await queryRunner.createForeignKey(
      'contact_tags',
      new TableForeignKey({
        columnNames: ['assigned_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Índice único: contact_id + tag_id (no asignar el mismo tag dos veces)
    await queryRunner.createIndex(
      'contact_tags',
      new TableIndex({
        name: 'IDX_CONTACT_TAGS_CONTACT_TAG',
        columnNames: ['contact_id', 'tag_id'],
        isUnique: true,
      }),
    );

    console.log('✅ Tablas contacts, tags y contact_tags creadas exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar en orden inverso (por las foreign keys)
    await queryRunner.dropTable('contact_tags', true);
    await queryRunner.dropTable('tags', true);
    await queryRunner.dropTable('contacts', true);

    console.log('✅ Tablas contacts, tags y contact_tags eliminadas');
  }
}



