// TikTok configuration for sandbox/production mode
export const TIKTOK_CONFIG = {
  // Mode: 'sandbox' or 'production'
  mode: (import.meta.env.VITE_TIKTOK_MODE as 'sandbox' | 'production') || 'sandbox',
  
  // Demo mode enabled by default in sandbox
  demoModeEnabled: import.meta.env.VITE_TIKTOK_DEMO_MODE !== 'false',
  
  // Allow simulated send in demo mode
  allowSimulatedSend: import.meta.env.VITE_TIKTOK_ALLOW_SIMULATED_SEND !== 'false',
  
  // Helpers
  get isSandbox() {
    return this.mode === 'sandbox';
  },
  
  get isProduction() {
    return this.mode === 'production';
  },
  
  get canUseDemo() {
    return this.isSandbox && this.demoModeEnabled;
  },
  
  get canSimulateSend() {
    return this.canUseDemo && this.allowSimulatedSend;
  },
};

export type TikTokMode = 'sandbox' | 'production';
