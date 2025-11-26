// Script para verificar la conexión a PostgreSQL
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5433),
  user: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'receptionistai',
};

console.log('Intentando conectar a PostgreSQL con:');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  User:', config.user);
console.log('  Database:', config.database);
console.log('  Password:', config.password ? '***' : '(vacío)');
console.log('');

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('✅ Conexión exitosa a PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('Versión de PostgreSQL:', result.rows[0].version);
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Error al conectar:', err.message);
    console.error('');
    console.error('Posibles soluciones:');
    console.error('1. Verifica que PostgreSQL esté corriendo:');
    console.error('   docker ps (si usas Docker)');
    console.error('   o verifica el servicio de PostgreSQL');
    console.error('');
    console.error('2. Verifica que el archivo .env exista en la raíz del proyecto');
    console.error('3. Verifica que las variables DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD estén configuradas');
    console.error('4. Si usas Docker, inicia los contenedores:');
    console.error('   docker-compose up -d postgres');
    process.exit(1);
  });


