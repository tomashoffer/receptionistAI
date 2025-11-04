import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiConfigService } from './shared/services/api-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import AppDataSource from './data-source';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shared/shared.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { VoiceModule } from './modules/voice/voice.module';
import { GoogleModule } from './modules/google/google.module';
import { BusinessModule } from './modules/business/business.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { ElevenlabsModule } from './modules/elevenlabs/elevenlabs.module';
import { GoogleCalendarModule } from './modules/google-calendar/google-calendar.module';
import { UtilsModule } from './modules/utils/utils.module';

@Module({
  imports: [
    // The ConfigModule is imported first and set to 'isGlobal: true'.
    // This ensures that the .env file is loaded and its variables are
    // available to all other modules in the application without needing
    // to re-import ConfigModule elsewhere.
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    // Asynchronously configure TypeORM using the ApiConfigService.
    // This is a good practice as it ensures the ConfigService is ready
    // before attempting to establish a database connection.
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
          configService.postgresConfig,
      inject: [ApiConfigService],
    }),

    // This second TypeORM configuration might be for a different purpose,
    // like running migrations with a static configuration.
    TypeOrmModule.forRoot(AppDataSource.options),
    
    // Application feature modules.
    AuthModule,
    UserModule,
    PaymentsModule,
    AppointmentsModule,
    VoiceModule,
    GoogleModule,
    BusinessModule,
    WebhookModule,
    AssistantModule,
    ElevenlabsModule,
    GoogleCalendarModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}