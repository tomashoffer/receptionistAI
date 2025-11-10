export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  provider: '11labs' | 'elevenlabs' | 'vapi';
  language: string;
  recommended?: boolean;
}

// Voces de ElevenLabs disponibles en Vapi
// Provider: '11labs' (así se llama ElevenLabs en Vapi)
export const VAPI_VOICES: Voice[] = [
  // Voces en español (ElevenLabs en Vapi)
  { id: '1WXz8v08ntDcSTeVXMN2', name: 'Malena Tango', gender: 'female', provider: '11labs', language: 'es-ES', recommended: true },
  { id: 'PBi4M0xL4G7oVYxKgqww', name: 'Franco', gender: 'male', provider: '11labs', language: 'es-ES', recommended: true },
  { id: 'bN1bDXgDIGX5lw0rtY2B', name: 'Melanie', gender: 'female', provider: '11labs', language: 'es-ES' },
  
  // Voces en inglés (ElevenLabs en Vapi)
  { id: '2qfp6zPuviqeCOZIE9RZ', name: 'Christina', gender: 'female', provider: '11labs', language: 'en-US', recommended: true },
  { id: 'DHeSUVQvhhYeIxNUbtj3', name: 'Christopher', gender: 'male', provider: '11labs', language: 'en-US' },
  { id: 'D9Thk1W7FRMgiOhy3zVI', name: 'Aaron', gender: 'male', provider: '11labs', language: 'en-US' },
];

// Para compatibilidad con código existente
export const ELEVENLABS_VOICES: Voice[] = VAPI_VOICES;

// Todas las voces disponibles (Vapi con ElevenLabs)
export const ALL_VOICES: Voice[] = [
  ...VAPI_VOICES
];

// Voces recomendadas para español
export const SPANISH_VOICES: Voice[] = [
  ...VAPI_VOICES.filter(v => v.language === 'es-ES')
];

// Voces recomendadas para inglés
export const ENGLISH_VOICES: Voice[] = [
  ...VAPI_VOICES.filter(v => v.language === 'en-US')
];

// Funciones para obtener voces por idioma
export const getVoicesByLanguage = (language: string): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language);
};

export const getVoicesByProvider = (provider: '11labs' | 'elevenlabs' | 'vapi'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.provider === provider);
};

export const getVoicesByLanguageAndProvider = (language: string, provider: '11labs' | 'elevenlabs' | 'vapi'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language && voice.provider === provider);
};

// Idiomas disponibles
export const AVAILABLE_LANGUAGES = [
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

// Proveedores disponibles
export const AVAILABLE_PROVIDERS = [
  { code: '11labs', name: '11labs (ElevenLabs en Vapi)', icon: '🎤' }
];

// Voces por defecto (Vapi)
export const DEFAULT_VOICE_ID = '1WXz8v08ntDcSTeVXMN2'; // Malena Tango (español)
export const DEFAULT_SPANISH_VOICE_ID = '1WXz8v08ntDcSTeVXMN2'; // Malena Tango
export const DEFAULT_ENGLISH_VOICE_ID = '2qfp6zPuviqeCOZIE9RZ'; // Christina





