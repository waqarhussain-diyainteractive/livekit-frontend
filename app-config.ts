export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  welcomeNote: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Veritas Learning Centre',
  pageTitle: 'Learn about cells with VLC',
  pageDescription: 'A voice agent built with LiveKit',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/vlc-logo-dark.png',
  accent: '#002cf2',
  logoDark: '/vlc-logo-dark.png',
  accentDark: '#1fd5f9',
  startButtonText: "Let's talk about cells.",
  welcomeNote:
    'I am here to help you learn about cells. Ask me anything about cell structure, functions, and more!',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
