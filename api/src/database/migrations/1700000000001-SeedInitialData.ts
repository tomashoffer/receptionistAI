import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1700000000001 implements MigrationInterface {
  name = 'SeedInitialData1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insertar planes iniciales
    await queryRunner.query(`
      INSERT INTO business_plans (id, name, description, price_monthly, call_minutes_limit, integrations_limit, users_limit, features, is_active, created_at, updated_at)
      VALUES 
        (
          '11111111-1111-1111-1111-111111111111',
          'Trial',
          'Plan de prueba gratuito por 14 días',
          0.00,
          100,
          1,
          1,
          '[
            {"name": "Llamadas básicas", "description": "Hasta 100 minutos de llamadas", "enabled": true},
            {"name": "1 Integración", "description": "Google Calendar o Drive", "enabled": true},
            {"name": "1 Usuario", "description": "Solo el propietario", "enabled": true},
            {"name": "Soporte por email", "description": "Soporte básico", "enabled": true}
          ]',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        (
          '22222222-2222-2222-2222-222222222222',
          'Starter',
          'Plan básico para pequeños negocios',
          29.99,
          500,
          2,
          3,
          '[
            {"name": "Llamadas estándar", "description": "Hasta 500 minutos de llamadas", "enabled": true},
            {"name": "2 Integraciones", "description": "Google Calendar y Drive", "enabled": true},
            {"name": "3 Usuarios", "description": "Propietario + 2 staff", "enabled": true},
            {"name": "Soporte prioritario", "description": "Soporte por email y chat", "enabled": true},
            {"name": "Analytics básicos", "description": "Reportes de llamadas", "enabled": true}
          ]',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        (
          '33333333-3333-3333-3333-333333333333',
          'Professional',
          'Plan profesional para negocios en crecimiento',
          79.99,
          2000,
          5,
          10,
          '[
            {"name": "Llamadas ilimitadas", "description": "Hasta 2000 minutos de llamadas", "enabled": true},
            {"name": "5 Integraciones", "description": "Google Calendar, Drive, CRM, etc.", "enabled": true},
            {"name": "10 Usuarios", "description": "Equipo completo", "enabled": true},
            {"name": "Soporte premium", "description": "Soporte 24/7 por teléfono", "enabled": true},
            {"name": "Analytics avanzados", "description": "Reportes detallados y insights", "enabled": true},
            {"name": "Personalización", "description": "Prompts personalizados", "enabled": true}
          ]',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        (
          '44444444-4444-4444-4444-444444444444',
          'Enterprise',
          'Plan empresarial para grandes organizaciones',
          199.99,
          0,
          0,
          0,
          '[
            {"name": "Llamadas ilimitadas", "description": "Sin límite de minutos", "enabled": true},
            {"name": "Integraciones ilimitadas", "description": "Todas las integraciones disponibles", "enabled": true},
            {"name": "Usuarios ilimitados", "description": "Sin límite de usuarios", "enabled": true},
            {"name": "Soporte dedicado", "description": "Gerente de cuenta dedicado", "enabled": true},
            {"name": "Analytics empresariales", "description": "Dashboard personalizado", "enabled": true},
            {"name": "Personalización completa", "description": "Prompts y voz personalizados", "enabled": true},
            {"name": "API personalizada", "description": "Acceso a API para integraciones", "enabled": true},
            {"name": "SLA garantizado", "description": "99.9% uptime garantizado", "enabled": true}
          ]',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar planes iniciales
    await queryRunner.query(`
      DELETE FROM business_plans 
      WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
      );
    `);
  }
}
