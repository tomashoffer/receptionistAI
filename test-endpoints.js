// Script de pruebas para endpoints públicos de la API
const BASE_URL = 'http://localhost:3001';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, body = null) {
  try {
    log(`\n🧪 Probando: ${name}`, 'blue');
    log(`   ${method} ${url}`, 'yellow');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
      log(`   Body: ${JSON.stringify(body, null, 2)}`, 'yellow');
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ error: 'No JSON response' }));

    if (response.ok) {
      log(`   ✅ Éxito (${response.status})`, 'green');
      log(`   Respuesta: ${JSON.stringify(data, null, 2).substring(0, 200)}...`, 'green');
      return { success: true, data, status: response.status };
    } else {
      log(`   ❌ Error (${response.status})`, 'red');
      log(`   Respuesta: ${JSON.stringify(data, null, 2)}`, 'red');
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log(`   ❌ Excepción: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Iniciando pruebas de endpoints...\n', 'blue');

  // Necesitamos un business_id para las pruebas
  // Por ahora usaremos uno de prueba - en producción deberías obtenerlo de la BD
  const TEST_BUSINESS_ID = process.env.TEST_BUSINESS_ID || '00000000-0000-0000-0000-000000000000';
  const TEST_EMAIL = 'test@example.com';
  const TEST_PHONE = '+1234567890';
  const TEST_NAME = 'Test User';

  log(`📋 Usando business_id: ${TEST_BUSINESS_ID}`, 'yellow');
  log(`📋 Si necesitas otro business_id, configura TEST_BUSINESS_ID en .env\n`, 'yellow');

  const results = [];

  // Test 1: Buscar contacto por email (probablemente no existe)
  results.push(await testEndpoint(
    'GET /contacts/by-identifier (por email)',
    'GET',
    `${BASE_URL}/contacts/by-identifier?business_id=${TEST_BUSINESS_ID}&email=${TEST_EMAIL}`
  ));

  // Test 2: Buscar contacto por teléfono (probablemente no existe)
  results.push(await testEndpoint(
    'GET /contacts/by-identifier (por teléfono)',
    'GET',
    `${BASE_URL}/contacts/by-identifier?business_id=${TEST_BUSINESS_ID}&phone=${encodeURIComponent(TEST_PHONE)}`
  ));

  // Test 3: Crear un contacto nuevo
  const createContactResult = await testEndpoint(
    'POST /contacts (crear contacto)',
    'POST',
    `${BASE_URL}/contacts`,
    {
      business_id: TEST_BUSINESS_ID,
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      source: 'manual',
    }
  );

  results.push(createContactResult);

  let contactId = null;
  if (createContactResult.success && createContactResult.data?.id) {
    contactId = createContactResult.data.id;
    log(`\n✅ Contacto creado con ID: ${contactId}`, 'green');

    // Test 4: Buscar contacto recién creado
    results.push(await testEndpoint(
      'GET /contacts/by-identifier (buscar contacto creado)',
      'GET',
      `${BASE_URL}/contacts/by-identifier?business_id=${TEST_BUSINESS_ID}&email=${TEST_EMAIL}`
    ));

    // Test 5: Obtener appointments del contacto (probablemente vacío)
    results.push(await testEndpoint(
      'GET /contacts/{id}/appointments',
      'GET',
      `${BASE_URL}/contacts/${contactId}/appointments`
    ));
  }

  // Test 6: Crear appointment con contacto (auto-creación)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = tomorrow.toISOString().split('T')[0];
  const appointmentTime = '10:00';

  const createAppointmentResult = await testEndpoint(
    'POST /appointments/with-contact',
    'POST',
    `${BASE_URL}/appointments/with-contact`,
    {
      business_id: TEST_BUSINESS_ID,
      clientName: TEST_NAME,
      clientPhone: TEST_PHONE,
      clientEmail: TEST_EMAIL,
      serviceType: 'Test Service',
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      notes: 'Test appointment from script',
    }
  );

  results.push(createAppointmentResult);

  let appointmentId = null;
  let googleCalendarEventId = null;
  if (createAppointmentResult.success && createAppointmentResult.data?.id) {
    appointmentId = createAppointmentResult.data.id;
    googleCalendarEventId = createAppointmentResult.data.googleCalendarEventId;
    log(`\n✅ Appointment creado con ID: ${appointmentId}`, 'green');
    log(`   Google Calendar Event ID: ${googleCalendarEventId || 'N/A'}`, 'yellow');
  }

  // Test 7: Obtener appointments por rango
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  results.push(await testEndpoint(
    'GET /appointments/range',
    'GET',
    `${BASE_URL}/appointments/range?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
  ));

  // Test 8: Buscar appointment por Google Calendar ID (si existe)
  if (googleCalendarEventId) {
    results.push(await testEndpoint(
      'GET /appointments/by-calendar-id',
      'GET',
      `${BASE_URL}/appointments/by-calendar-id?googleCalendarEventId=${googleCalendarEventId}`
    ));
  } else {
    log('\n⚠️  Saltando test de by-calendar-id (no hay googleCalendarEventId)', 'yellow');
  }

  // Test 9: Actualizar appointment (si existe)
  if (appointmentId) {
    results.push(await testEndpoint(
      'PATCH /appointments/{id}',
      'PATCH',
      `${BASE_URL}/appointments/${appointmentId}`,
      {
        notes: 'Updated from test script',
      }
    ));
  }

  // Resumen
  log('\n\n📊 RESUMEN DE PRUEBAS\n', 'blue');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Exitosas: ${successful}`, 'green');
  log(`❌ Fallidas: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Total: ${results.length}\n`, 'blue');

  if (failed > 0) {
    log('❌ Algunas pruebas fallaron. Revisa los detalles arriba.', 'red');
    process.exit(1);
  } else {
    log('✅ Todas las pruebas pasaron exitosamente!', 'green');
    process.exit(0);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

