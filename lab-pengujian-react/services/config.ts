/// <reference types="vite/client" />

// Configuration module for environment-based settings
// Uses window.__ENV__ for runtime injection (Docker) with Vite env fallback

interface AppConfig {
  API_BASE_URL: string;
  USE_MOCK_DATA: boolean;
}

// Extend Window interface for runtime config
declare global {
  interface Window {
    __ENV__?: Partial<AppConfig>;
  }
}

// Helper to get config value with runtime override support
function getConfigValue<T>(
  key: keyof AppConfig,
  defaultValue: T,
  transform?: (val: string) => T
): T {
  // First check runtime config (injected by Docker at container start)
  if (typeof window !== 'undefined' && window.__ENV__) {
    const runtimeValue = window.__ENV__[key];
    if (runtimeValue !== undefined) {
      return runtimeValue as unknown as T;
    }
  }

  // Then check Vite build-time env vars
  const viteKey = `VITE_${key}`;
  const envValue = import.meta.env[viteKey] as string | undefined;

  if (envValue !== undefined && envValue !== '') {
    if (transform) {
      return transform(String(envValue));
    }
    return envValue as unknown as T;
  }

  return defaultValue;
}

// Application configuration
export const config: AppConfig = {
  API_BASE_URL: getConfigValue('API_BASE_URL', 'http://localhost:8000/api'),
  USE_MOCK_DATA: getConfigValue('USE_MOCK_DATA', true, (val) => val === 'true'),
};

export default config;
