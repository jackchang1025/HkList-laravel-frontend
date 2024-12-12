interface AppConfig {
  apiBaseUrl: string;
  uploadMaxSize: number;
  timeout: number;
}

declare global {
  interface Window {
    APP_CONFIG: AppConfig;
  }
}

export function getConfig(): AppConfig {
  return window.APP_CONFIG;
} 