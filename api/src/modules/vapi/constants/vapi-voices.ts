export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  provider: 'vapi' | 'elevenlabs' | 'azure';
  language: string;
  recommended?: boolean;
}

// Voces de Vapi (inglés)
export const VAPI_VOICES: Voice[] = [
  { id: 'Elliot', name: 'Elliot', gender: 'male', provider: 'vapi', language: 'en-US' },
  { id: 'Kylie', name: 'Kylie', gender: 'female', provider: 'vapi', language: 'en-US' },
  { id: 'Rohan', name: 'Rohan', gender: 'male', provider: 'vapi', language: 'en-US' },
  { id: 'Lily', name: 'Lily', gender: 'female', provider: 'vapi', language: 'en-US' },
  { id: 'Savannah', name: 'Savannah', gender: 'female', provider: 'vapi', language: 'en-US' },
  { id: 'Hana', name: 'Hana', gender: 'female', provider: 'vapi', language: 'en-US', recommended: true },
  { id: 'Neha', name: 'Neha', gender: 'female', provider: 'vapi', language: 'en-US' },
  { id: 'Cole', name: 'Cole', gender: 'male', provider: 'vapi', language: 'en-US' },
  { id: 'Harry', name: 'Harry', gender: 'male', provider: 'vapi', language: 'en-US' },
  { id: 'Paige', name: 'Paige', gender: 'female', provider: 'vapi', language: 'en-US' },
  { id: 'Spencer', name: 'Spencer', gender: 'male', provider: 'vapi', language: 'en-US' }
];

// Voces de ElevenLabs
export const ELEVENLABS_VOICES: Voice[] = [
  // Voces en inglés
  { id: '8s7FhQuwCMptPvCeDnKj', name: 'Mark', gender: 'male', provider: 'elevenlabs', language: 'en-US', recommended: true },
  { id: 'CvD6hF1BJzAFN428j1cO', name: 'Kristen', gender: 'female', provider: 'elevenlabs', language: 'en-US' },
  { id: 'bN1bDXgDIGX5lw0rtY2B', name: 'Melanie', gender: 'female', provider: 'elevenlabs', language: 'en-US' },
  
  // Voces en español
  { id: 'p7AwDmKvTdoHTBuueGvP', name: 'Malena', gender: 'female', provider: 'elevenlabs', language: 'es-ES', recommended: true },
  { id: 'voivgekQLm3GYiKMHUnPVvY', name: 'Agustin', gender: 'male', provider: 'elevenlabs', language: 'es-ES' },
  { id: 'gBTPbHzRd0ZmV75Z5Zk4', name: 'Carlos', gender: 'male', provider: 'elevenlabs', language: 'es-ES' },
];

// Voces de Azure
export const AZURE_VOICES: Voice[] = [
  // Voces en inglés
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female', provider: 'azure', language: 'en-US', recommended: true },
  { id: 'en-US-DavisNeural', name: 'Davis', gender: 'male', provider: 'azure', language: 'en-US' },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', provider: 'azure', language: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', provider: 'azure', language: 'en-US' },
  { id: 'en-US-AmberNeural', name: 'Amber', gender: 'female', provider: 'azure', language: 'en-US' },
  { id: 'en-US-BrandonNeural', name: 'Brandon', gender: 'male', provider: 'azure', language: 'en-US' },
  
  // Voces en español
  { id: 'es-ES-ElviraNeural', name: 'Elvira', gender: 'female', provider: 'azure', language: 'es-ES', recommended: true },
  { id: 'es-ES-AlvaroNeural', name: 'Álvaro', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-ArnauNeural', name: 'Arnau', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-DarioNeural', name: 'Darío', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-EliasNeural', name: 'Elías', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-EstrellaNeural', name: 'Estrella', gender: 'female', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-IreneNeural', name: 'Irene', gender: 'female', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-LaiaNeural', name: 'Laia', gender: 'female', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-LiaNeural', name: 'Lia', gender: 'female', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-NilNeural', name: 'Nil', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-SaulNeural', name: 'Saúl', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-TeoNeural', name: 'Teo', gender: 'male', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-TrianaNeural', name: 'Triana', gender: 'female', provider: 'azure', language: 'es-ES' },
  { id: 'es-ES-VeraNeural', name: 'Vera', gender: 'female', provider: 'azure', language: 'es-ES' }
];

// Todas las voces disponibles
export const ALL_VOICES: Voice[] = [
  ...VAPI_VOICES,
  ...ELEVENLABS_VOICES,
  ...AZURE_VOICES
];

// Voces recomendadas para español
export const SPANISH_VOICES: Voice[] = [
  ...ELEVENLABS_VOICES.filter(v => v.language === 'es-ES'),
  ...AZURE_VOICES.filter(v => v.language === 'es-ES')
];

// Voces recomendadas para inglés
export const ENGLISH_VOICES: Voice[] = [
  ...VAPI_VOICES,
  ...ELEVENLABS_VOICES.filter(v => v.language === 'en-US'),
  ...AZURE_VOICES.filter(v => v.language === 'en-US')
];

// Funciones para obtener voces por idioma
export const getVoicesByLanguage = (language: string): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language);
};

export const getVoicesByProvider = (provider: 'vapi' | 'elevenlabs' | 'azure'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.provider === provider);
};

export const getVoicesByLanguageAndProvider = (language: string, provider: 'vapi' | 'elevenlabs' | 'azure'): Voice[] => {
  return ALL_VOICES.filter(voice => voice.language === language && voice.provider === provider);
};

// Idiomas disponibles
export const AVAILABLE_LANGUAGES = [
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

// Proveedores disponibles
export const AVAILABLE_PROVIDERS = [
  { code: 'azure', name: 'Azure', icon: '🔵' },
  { code: 'elevenlabs', name: 'ElevenLabs', icon: '🎤' },
  { code: 'vapi', name: 'Vapi', icon: '🎯' }
];

// Voces por defecto
export const DEFAULT_VOICE_ID = 'Hana';
export const DEFAULT_SPANISH_VOICE_ID = 'es-ES-ElviraNeural';
export const DEFAULT_ENGLISH_VOICE_ID = 'en-US-AriaNeural';

