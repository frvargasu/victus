import type { CapacitorConfig } from '@capacitor/cli';

// Variables de entorno por plataforma
const isDev = process.env['NODE_ENV'] === 'development';
const platform = process.env['CAPACITOR_PLATFORM'] || 'web';

// Configuración base común
const baseConfig: CapacitorConfig = {
  appId: 'io.victus.app',
  appName: 'Victus',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: isDev ? 1000 : 3000,
      launchAutoHide: true,
      backgroundColor: "#1976d2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK"
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    },
    Toast: {
      duration: "short",
      position: "bottom"
    },
    Geolocation: {
      permissions: {
        location: "when-in-use"
      }
    }
  }
};

// Configuraciones específicas por plataforma
const platformConfigs = {
  android: {
    ...baseConfig,
    android: {
      allowMixedContent: isDev,
      captureInput: true,
      webContentsDebuggingEnabled: isDev,
      loggingBehavior: isDev ? 'debug' : 'production',
      buildOptions: {
        keystorePath: isDev ? undefined : 'android/keystores/Victus-ionic',
        keystoreAlias: isDev ? undefined : 'Victus-key',
        releaseType: isDev ? 'debug' : 'release'
      }
    },
    plugins: {
      ...baseConfig.plugins,
      SplashScreen: {
        ...baseConfig.plugins?.['SplashScreen'],
        launchShowDuration: 2000,
        androidScaleType: "CENTER_CROP"
      }
    }
  },
  ios: {
    ...baseConfig,
    ios: {
      contentInset: 'automatic',
      scrollEnabled: true,
      allowsLinkPreview: false,
      handleApplicationNotifications: true,
      limitsNavigationsToAppBoundDomains: true
    },
    plugins: {
      ...baseConfig.plugins,
      SplashScreen: {
        ...baseConfig.plugins?.['SplashScreen'],
        launchShowDuration: 1500,
        iosSpinnerStyle: "small"
      }
    }
  },
  web: {
    ...baseConfig,
    server: isDev ? {
      url: 'http://localhost:8100',
      cleartext: true
    } : undefined,
    plugins: {
      ...baseConfig.plugins,
      SplashScreen: {
        ...baseConfig.plugins?.['SplashScreen'],
        launchShowDuration: 1000
      }
    }
  }
};

// Seleccionar configuración basada en la plataforma
const config = platformConfigs[platform as keyof typeof platformConfigs] || baseConfig;

export default config;
