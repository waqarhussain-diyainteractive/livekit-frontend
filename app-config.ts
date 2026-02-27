export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  favlogo: string;
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
  companyName: 'Health4Travel',
  pageTitle: 'Smart Clinic Assistant',
  pageDescription: 'AI-powered medical receptionist for seamless global clinic bookings.',

  // Input Settings
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  // Branding & UI
  logo: 'https://customer.health4travel.com/static/media/h4tLogo.3b3f9bb3bc531faa471910633d743d52.svg',
  favlogo: 'https://customer.health4travel.com/logo192.png',
  accent: '#183a59', // H4T Deep Blue
  logoDark: 'https://customer.health4travel.com/static/media/h4tLogo.3b3f9bb3bc531faa471910633d743d52.svg',
  accentDark: '#34d399', // Emerald Green Accent
  
  // Copy
  startButtonText: "Start Call",
  welcomeNote:
    "Welcome to the Health4Travel booking center. I am your dedicated medical booking agent. I am here to help you locate our international clinics, check doctor availability, and seamlessly schedule your appointments. Click below to connect.",

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};