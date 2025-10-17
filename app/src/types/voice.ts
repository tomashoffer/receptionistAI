export interface VoiceResponse {
  id: string;
  sessionId: string;
  transcription: string;
  intent?: {
    type: string;
    entities: Record<string, unknown>;
    confidence: number;
    missingEntities?: string[];
  };
  response: string;
  confidence: number;
  intentType: string;
  status: string;
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  duration: number;
  sessionId: string;
}

export interface VoiceConfig {
  language: string;
  voice: string;
  speed: number;
  volume: number;
}
