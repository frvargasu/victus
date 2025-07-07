# Actividad 4: Configuraciones Multiplataforma

## Resumen
Esta actividad implementa un sistema completo de configuraciones multiplataforma para la aplicación Victus, con soporte para Android, iOS y Web, incluyendo variables de entorno, configuraciones específicas por plataforma y herramientas de verificación.

## 📋 Contenido Implementado

### 1. Configuración de Capacitor Multiplataforma
- **Archivo**: `capacitor.config.ts`
- **Características**:
  - Configuración base común para todas las plataformas
  - Configuraciones específicas por plataforma (Android, iOS, Web)
  - Detección automática de entorno (desarrollo/producción)
  - Configuración condicional según la plataforma detectada

### 2. Configuraciones de Entorno
- **Archivos de configuración**:
  - `src/environments/environment.ts` (desarrollo)
  - `src/environments/environment.prod.ts` (producción)
  - `src/environments/environment.staging.ts` (staging)

- **Configuraciones incluidas**:
  - URLs de API por entorno
  - Configuraciones de logging
  - Características habilitadas/deshabilitadas
  - Configuración de base de datos
  - Configuraciones específicas por plataforma

### 3. Servicio de Configuración
- **Archivo**: `src/app/services/config.service.ts`
- **Funcionalidades**:
  - Detección automática de plataforma
  - Acceso centralizado a configuraciones
  - Métodos de verificación de características
  - Logging condicional por nivel
  - Información del entorno

### 4. Scripts de Verificación
- **Script de verificación de entorno**: `scripts/check-environment.js`
- **Script de pruebas multiplataforma**: `scripts/multiplatform-test.js`

## 🚀 Uso

### Verificación del Entorno
```bash
# Verifica configuraciones del entorno de desarrollo
npm run env:check

# Ejecuta pruebas multiplataforma
npm run env:test

# Verifica y probar todo el entorno
npm run multiplatform:test
```

### Builds Multiplataforma
```bash
# Build para múltiples plataformas
npm run multiplatform:build

# Configura entorno completo
npm run multiplatform:setup
```

## 📱 Configuraciones por Plataforma

### Android
- **Configuraciones específicas**:
  - `allowMixedContent`: Permite contenido mixto en desarrollo
  - `webContentsDebuggingEnabled`: Habilita debug en desarrollo
  - `keystorePath`: Ruta al keystore para releases
  - `buildOptions`: Opciones de compilación
  - `SplashScreen`: Configuración específica de splash screen

### iOS
- **Configuraciones específicas**:
  - `contentInset`: Ajuste automático de contenido
  - `scrollEnabled`: Habilita scroll
  - `allowsLinkPreview`: Deshabilita preview de links
  - `handleApplicationNotifications`: Manejo de notificaciones
  - `limitsNavigationsToAppBoundDomains`: Limita navegación

### Web
- **Configuraciones específicas**:
  - `server`: Configuración de servidor de desarrollo
  - `cleartext`: Permite HTTP en desarrollo
  - `SplashScreen`: Configuración optimizada para web

## 🔧 Variables de Entorno

### Variables Requeridas
- `JAVA_HOME`: Ruta al JDK
- `ANDROID_SDK_ROOT`: Ruta al Android SDK
- `NODE_ENV`: Entorno de desarrollo (development/production)
- `CAPACITOR_PLATFORM`: Plataforma objetivo (android/ios/web)

### Variables Opcionales
- `IONIC_ENV`: Entorno Ionic específico
- `ANDROID_HOME`: Ruta alternativa al Android SDK

## 📊 Herramientas de Verificación

### Check Environment Script
El script `check-environment.js` verifica:
- ✅ Variables de entorno requeridas
- ✅ Instalación de Java y Android SDK
- ✅ Herramientas de Ionic y Capacitor
- ✅ Archivos de configuración del proyecto
- ✅ Plataformas Capacitor disponibles

### Multiplatform Test Script
El script `multiplatform-test.js` ejecuta:
- 🌐 Build y verificación para Web
- 🤖 Build y verificación para Android
- 🍎 Sync y verificación para iOS (solo en macOS)
- ⚙️ Validación de configuraciones de entorno

## 🎯 Configuración del Servicio

### Uso del ConfigService
```typescript
import { ConfigService } from './services/config.service';

// Inyectar en constructor
constructor(private configService: ConfigService) {}

// Verificar plataforma
if (this.configService.isAndroid()) {
  // Código específico para Android
}

// Verificar características
if (this.configService.hasFeature('camera')) {
  // Usar cámara
}

// Logging condicional
this.configService.log('Mensaje de debug', 'debug');

// Obtener configuración
const config = this.configService.platformConfig;
```

## 🔍 Verificación de Instalación

### Verificar Herramientas Requeridas
```bash
# Verificar Java
java -version

# Verificar Android SDK
echo $ANDROID_SDK_ROOT

# Verificar Ionic
ionic version

# Verificar Capacitor
npx cap --version
```

### Verificar Configuración del Proyecto
```bash
# Verificar entorno completo
npm run env:check

# Ejemplo de salida:
# ✅ JAVA_HOME: C:\Program Files\Java\jdk-11.0.11
# ✅ ANDROID_SDK_ROOT: C:\Users\user\AppData\Local\Android\Sdk
# ✅ Java instalado: java 11.0.11
# ✅ Ionic CLI: 7.2.0
# ✅ Capacitor: 6.1.2
```

## 📈 Métricas de Rendimiento

### Tiempos de Build (aproximados)
- 🌐 **Web**: 15-30 segundos
- 🤖 **Android Debug**: 1-2 minutos
- 🤖 **Android Release**: 2-3 minutos
- 🍎 **iOS**: 1-2 minutos (solo macOS)

### Puntuación del Entorno
- 🟢 **GOOD** (80-100%): Entorno completamente configurado
- 🟡 **WARNING** (60-79%): Algunas herramientas faltan
- 🔴 **CRITICAL** (<60%): Configuración incompleta

## 📝 Estructura de Archivos

```
src/
├── environments/
│   ├── environment.ts              # Desarrollo
│   ├── environment.prod.ts         # Producción
│   └── environment.staging.ts      # Staging
├── app/
│   └── services/
│       └── config.service.ts       # Servicio de configuración
├── capacitor.config.ts             # Configuración Capacitor
└── scripts/
    ├── check-environment.js        # Verificación de entorno
    └── multiplatform-test.js       # Pruebas multiplataforma
```

## 🔧 Personalización

### Agregar Nueva Plataforma
1. Agregar configuración en `capacitor.config.ts`
2. Actualizar `environment.ts` files
3. Modificar `ConfigService` para detectar nueva plataforma
4. Actualizar scripts de verificación

### Modificar Configuraciones
- **API URLs**: Modificar en archivos `environment.*.ts`
- **Características**: Actualizar objeto `features` en environments
- **Configuraciones específicas**: Modificar objetos de plataforma

## 🐛 Solución de Problemas

### Errores Comunes
1. **JAVA_HOME no definido**
   - Solución: Configurar variable de entorno JAVA_HOME
   
2. **Android SDK no encontrado**
   - Solución: Configurar ANDROID_SDK_ROOT

3. **Build Android falla**
   - Verificar: Keystore configurado correctamente
   - Verificar: Permisos de archivo

### Verificar Logs
```bash
# Logs detallados de build
npm run env:test -- --verbose

# Logs de Capacitor
npx cap doctor
```

## 🎉 Validación de Actividad

### Checklist de Completitud
- [x] Configuración multiplataforma implementada
- [x] Variables de entorno configuradas
- [x] Servicio de configuración creado
- [x] Scripts de verificación implementados
- [x] Documentación completa
- [x] Pruebas automatizadas configuradas

### Comandos de Validación
```bash
# Validar configuración completa
npm run multiplatform:test

# Validar builds
npm run multiplatform:build

# Validar entorno
npm run env:check
```

## 📚 Referencias
- [Capacitor Configuration](https://capacitorjs.com/docs/config)
- [Ionic Environment Variables](https://ionicframework.com/docs/cli/configuration)
- [Angular Build Configurations](https://angular.io/guide/build)

---

**Actividad 4 completada exitosamente** ✅

La aplicación Victus ahora cuenta con un sistema completo de configuraciones multiplataforma que permite:
- Desarrollo y despliegue en Android, iOS y Web
- Configuraciones específicas por entorno y plataforma
- Verificación automática del entorno de desarrollo
- Pruebas automatizadas multiplataforma
- Documentación completa y herramientas de debugging
