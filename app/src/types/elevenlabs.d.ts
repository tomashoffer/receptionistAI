/// <reference types="react" />

// Tipos para el web component de ElevenLabs
declare namespace JSX {
  interface IntrinsicElements {
    "elevenlabs-convai": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "agent-id"?: string;
      "signed-url"?: string;
      "server-location"?: string;
      "variant"?: string;
      "placement"?: string;
      "transcript-enabled"?: string;
      "avatar-image-url"?: string;
      "avatar-orb-color-1"?: string;
      "avatar-orb-color-2"?: string;
      "override-language"?: string;
      "action-text"?: string;
      "start-call-text"?: string;
      "end-call-text"?: string;
      "expand-text"?: string;
      "listening-text"?: string;
      "speaking-text"?: string;
      "dynamic-variables"?: string;
      "override-prompt"?: string;
      "override-first-message"?: string;
      "override-voice-id"?: string;
    };
  }
}
