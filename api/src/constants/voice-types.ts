export enum VoiceIntentType {
  GREETING = 'greeting',
  SCHEDULE = 'schedule',
  CANCEL = 'cancel',
  QUERY = 'query',
  GOODBYE = 'goodbye',
  HELP = 'help',
  UNKNOWN = 'unknown',
}

export enum VoiceProcessingStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial',
  PROCESSING = 'processing',
}

export enum AudioFormat {
  WAV = 'wav',
  MP3 = 'mp3',
  M4A = 'm4a',
  OGG = 'ogg',
}

