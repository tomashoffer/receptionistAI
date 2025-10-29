// Tipos para el web component de ElevenLabs
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id'?: string;
          'action-text'?: string;
          variant?: 'tiny' | 'compact' | 'full' | 'expandable';
          placement?: 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right' | 'center';
          'transcript-enabled'?: string;
          'avatar-image-url'?: string;
          'avatar-orb-color-1'?: string;
          'avatar-orb-color-2'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};

