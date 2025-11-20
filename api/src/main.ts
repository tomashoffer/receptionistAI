// Asegurar que crypto esté disponible globalmente ANTES de cualquier otra importación
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('crypto');
  if (crypto.webcrypto) {
    globalThis.crypto = crypto.webcrypto;
  } else {
    // Polyfill para crypto.randomUUID() si no está disponible
    globalThis.crypto = {
      ...crypto,
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    };
  }
}
require('dotenv').config();
import cookieParser from 'cookie-parser';
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

  if (!allowedOrigins) {
    // Fail-safe: If the variable is not set, throw an error during startup.
    throw new Error('CORS_ALLOWED_ORIGINS variable de ambiente no definida.');
  }

  // Create an array of allowed origins. This supports multiple domains.
  const whitelist = allowedOrigins.split(',').map(item => item.trim());

  //Enable CORS with a dynamic origin check.
  app.enableCors({
    origin: (origin, callback) => {
      // This will print the origin of every incoming request to your NestJS console.
      // Use this to debug the Google OAuth callback.
      // TODO: Remove or comment out in production.
      console.log(`CORS check: El origen de la peticion es [${origin}]`);

      // Allow requests if they have no origin (e.g., server-to-server, mobile apps, redirects)
      // OR if their origin is in our trusted whitelist.
      const isAllowed = !origin || whitelist.includes(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // Set up Swagger documentation.
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application.
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend escuchando en http://0.0.0.0:${port}`);
}
bootstrap();
