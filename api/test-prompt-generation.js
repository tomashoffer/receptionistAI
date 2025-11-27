/**
 * Script de prueba para la generación automática de prompts
 * 
 * Uso:
 * node test-prompt-generation.js <configId>
 * 
 * Ejemplo:
 * node test-prompt-generation.js 37bc3736-bbf3-48ea-b972-e63619dde97a
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const CONFIG_ID = process.argv[2];

if (!CONFIG_ID) {
  console.error('❌ Error: Debes proporcionar un ID de configuración');
  console.log('Uso: node test-prompt-generation.js <configId>');
  process.exit(1);
}

async function testPromptGeneration() {
  try {
    console.log('🔍 Obteniendo configuración actual...\n');
    
    // Obtener configuración actual
    const getResponse = await axios.get(`${API_URL}/assistant-configs/${CONFIG_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AUTH_TOKEN || 'test-token'}`,
      },
    });

    const config = getResponse.data;
    
    console.log('📋 Configuración actual:');
    console.log(`   ID: ${config.id}`);
    console.log(`   Business ID: ${config.business_id}`);
    console.log(`   Industry: ${config.industry}`);
    console.log(`   Prompt Voice Source: ${config.prompt_voice_source || 'N/A'}`);
    console.log(`   Is Custom Voice: ${config.is_custom_prompt_voice || false}`);
    console.log(`   Prompt Voice existe: ${config.prompt_voice ? '✅ Sí' : '❌ No'}`);
    
    if (config.prompt_voice) {
      console.log(`\n📝 Prompt Voice (primeros 500 caracteres):`);
      console.log('─'.repeat(80));
      console.log(config.prompt_voice.substring(0, 500) + '...');
      console.log('─'.repeat(80));
    }

    console.log('\n🔄 Regenerando prompt voice...\n');
    
    // Regenerar prompt voice
    const regenerateResponse = await axios.post(
      `${API_URL}/assistant-configs/${CONFIG_ID}/regenerate-voice-prompt`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.AUTH_TOKEN || 'test-token'}`,
        },
      }
    );

    const newPrompt = regenerateResponse.data.prompt_voice;
    
    console.log('✅ Prompt regenerado exitosamente!\n');
    console.log('📝 Nuevo Prompt Voice (primeros 500 caracteres):');
    console.log('─'.repeat(80));
    console.log(newPrompt.substring(0, 500) + '...');
    console.log('─'.repeat(80));
    
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Longitud total: ${newPrompt.length} caracteres`);
    console.log(`   Número de líneas: ${newPrompt.split('\n').length}`);
    console.log(`   Source: ${regenerateResponse.data.source}`);
    
    // Verificar que se guardó correctamente
    console.log('\n🔍 Verificando que se guardó en BD...\n');
    const verifyResponse = await axios.get(`${API_URL}/assistant-configs/${CONFIG_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AUTH_TOKEN || 'test-token'}`,
      },
    });

    const updatedConfig = verifyResponse.data;
    console.log(`   Prompt Voice Source: ${updatedConfig.prompt_voice_source}`);
    console.log(`   Is Custom Voice: ${updatedConfig.is_custom_prompt_voice}`);
    console.log(`   Prompt Voice existe: ${updatedConfig.prompt_voice ? '✅ Sí' : '❌ No'}`);
    
    if (updatedConfig.prompt_voice === newPrompt) {
      console.log('\n✅ ¡Éxito! El prompt se guardó correctamente en la base de datos.');
    } else {
      console.log('\n⚠️  Advertencia: El prompt guardado no coincide con el generado.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testPromptGeneration();


