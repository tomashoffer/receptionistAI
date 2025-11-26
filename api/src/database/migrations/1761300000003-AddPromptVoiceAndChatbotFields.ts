import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPromptVoiceAndChatbotFields1761300000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar prompt_voice
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_voice',
        type: 'text',
        isNullable: true,
      }),
    );

    // Agregar prompt_chatbot
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_chatbot',
        type: 'text',
        isNullable: true,
      }),
    );

    // Agregar is_custom_prompt_voice
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'is_custom_prompt_voice',
        type: 'boolean',
        default: false,
        isNullable: true,
      }),
    );

    // Agregar is_custom_prompt_chatbot
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'is_custom_prompt_chatbot',
        type: 'boolean',
        default: false,
        isNullable: true,
      }),
    );

    // Agregar prompt_voice_source
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_voice_source',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Agregar prompt_chatbot_source
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_chatbot_source',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Agregar prompt_voice_tokens
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_voice_tokens',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Agregar prompt_chatbot_tokens
    await queryRunner.addColumn(
      'assistant_configurations',
      new TableColumn({
        name: 'prompt_chatbot_tokens',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Migrar prompts existentes: copiar prompt actual a prompt_voice como 'migrated'
    await queryRunner.query(`
      UPDATE assistant_configurations 
      SET 
        prompt_voice = prompt,
        prompt_voice_source = 'migrated',
        is_custom_prompt_voice = false
      WHERE prompt_voice IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assistant_configurations', 'prompt_chatbot_tokens');
    await queryRunner.dropColumn('assistant_configurations', 'prompt_voice_tokens');
    await queryRunner.dropColumn('assistant_configurations', 'prompt_chatbot_source');
    await queryRunner.dropColumn('assistant_configurations', 'prompt_voice_source');
    await queryRunner.dropColumn('assistant_configurations', 'is_custom_prompt_chatbot');
    await queryRunner.dropColumn('assistant_configurations', 'is_custom_prompt_voice');
    await queryRunner.dropColumn('assistant_configurations', 'prompt_chatbot');
    await queryRunner.dropColumn('assistant_configurations', 'prompt_voice');
  }
}


