export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  provider: 'elevenlabs';
  language: string;
  recommended?: boolean;
}

// Voces de ElevenLabs para Conversational AI
// Nota: Estos son voice_id reales de ElevenLabs (voces oficiales)
export const ELEVENLABS_VOICES: Voice[] = [
  // Voces en inglés
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', provider: 'elevenlabs', language: 'en-US', recommended: true },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', provider: 'elevenlabs', language: 'en-US' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', provider: 'elevenlabs', language: 'en-US' },
  
  // Voces en español (funcionan bien con español)
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', provider: 'elevenlabs', language: 'es-ES', recommended: true },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', provider: 'elevenlabs', language: 'es-ES' },
  { id: 'JNcXxzrlvFDXcrGo2b47', name: 'Franco', gender: 'male', provider: 'elevenlabs', language: 'es-ES' },
  { id: '7t2HnXP73SsrxZf3OrN7', name: 'Jacobo', gender: 'male', provider: 'elevenlabs', language: 'es-ES' },
];

// Todas las voces disponibles (solo ElevenLabs)
export const ALL_VOICES: Voice[] = [
  ...ELEVENLABS_VOICES
];

// Voces recomendadas para español
export const SPANISH_VOICES: Voice[] = [
  ...ELEVENLABS_VOICES.filter(v => v.language === 'es-ES')
];

// Voces recomendadas para inglés
export const ENGLISH_VOICES: Voice[] = [
  ...ELEVENLABS_VOICES.filter(v => v.language === 'en-US')
];

// Funciones para obtener voces por idioma
export const getVoicesByLanguage = (language: string): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language);
};

export const getVoicesByProvider = (provider: 'elevenlabs'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.provider === provider);
};

export const getVoicesByLanguageAndProvider = (language: string, provider: 'elevenlabs'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language && voice.provider === provider);
};

// Idiomas disponibles
export const AVAILABLE_LANGUAGES = [
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

// Proveedores disponibles (solo ElevenLabs)
export const AVAILABLE_PROVIDERS = [
  { code: 'elevenlabs', name: 'ElevenLabs', icon: '🎤' }
];

// Voces por defecto
export const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella (spanish)
export const DEFAULT_SPANISH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella
export const DEFAULT_ENGLISH_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

