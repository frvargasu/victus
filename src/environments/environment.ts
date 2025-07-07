// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // Configuración de API
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 10000,
  
  // Configuración de logging
  enableLogging: true,
  logLevel: 'debug',
  
  // Configuración multiplataforma
  platform: {
    name: 'development',
    web: {
      enablePWA: true,
      serviceWorker: false
    },
    android: {
      enableDebugging: true,
      allowMixedContent: true,
      enableHardwareAcceleration: true
    },
    ios: {
      enableDebugging: true,
      allowsLinkPreview: false,
      scrollEnabled: true
    }
  },
  
  // Configuración de características
  features: {
    geolocation: true,
    camera: true,
    notifications: true,
    biometric: false,
    analytics: false
  },
  
  // Configuración de base de datos
  database: {
    name: 'victus_dev',
    version: 1,
    enableSQLiteEncryption: false
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
