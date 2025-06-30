import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'proyecto_ionic',
  webDir: 'www',
  plugins: {
    Geolocation: {
      permissions: {
        location: "when-in-use"
      }
    }
  }
};

export default config;
