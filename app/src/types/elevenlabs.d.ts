// Tipos para el web component de ElevenLabs
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id'?: string;
          'signed-url'?: string;
          'server-location'?: 'us' | string;
          variant?: 'tiny' | 'compact' | 'full' | 'expandable';
          placement?: 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right' | 'center';
          'transcript-enabled'?: string | boolean;
          'avatar-image-url'?: string;
          'avatar-orb-color-1'?: string;
          'avatar-orb-color-2'?: string;
          // Textos personalizados
          'action-text'?: string;
          'start-call-text'?: string;
          'end-call-text'?: string;
          'expand-text'?: string;
          'listening-text'?: string;
          'speaking-text'?: string;
          // Variables dinámicas y overrides
          'dynamic-variables'?: string;
          'override-language'?: string;
          'override-prompt'?: string;
          'override-first-message'?: string;
          'override-voice-id'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};

