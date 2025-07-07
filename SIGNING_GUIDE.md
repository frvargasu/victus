# 🔐 Firma de Aplicaciones Android - Proyecto Victus

## 📋 ¿Qué es la Firma de Apps?

La **firma digital** es un mecanismo de seguridad obligatorio en Android que:
- ✅ **Identifica al desarrollador** de la aplicación
- ✅ **Garantiza la integridad** del código (no ha sido modificado)
- ✅ **Permite actualizaciones** desde el mismo desarrollador
- ✅ **Habilita la publicación** en Google Play Store

## 🔑 Tipos de Keystores

### 1. Debug Keystore (Desarrollo)
```
Ubicación: ~/.android/debug.keystore
Alias: androiddebugkey
Password: android
```
- 🎯 **Uso**: Desarrollo y pruebas locales
- ❌ **Limitación**: NO válido para Play Store
- 🔄 **Regeneración**: Automática por Android Studio

### 2. Release Keystore (Producción)
```
Ubicación: Tu eliges (ej: victus-release-key.keystore)
Alias: Tu eliges (ej: victus-key)
Password: Tu eliges (¡GUÁRDALO BIEN!)
```
- 🎯 **Uso**: Publicación en Play Store
- ⚠️ **CRÍTICO**: Si lo pierdes, no puedes actualizar la app
- 💾 **Backup**: Guárdalo en lugar seguro

## 🛠️ Proceso de Firma en tu Proyecto

### Estructura de Archivos
```
victus/
├── android/
│   ├── app/
│   │   ├── build.gradle          # Configuración de firma
│   │   └── src/main/
│   ├── keystores/                # 📁 Carpeta para keystores
│   │   ├── debug.keystore        # Keystore de desarrollo
│   │   └── release.keystore      # Keystore de producción
│   └── keystore.properties       # 🔑 Configuración segura
```

## 🔐 Pasos para Configurar la Firma

### Paso 1: Generar Release Keystore
```bash
# Método automatizado (recomendado)
npm run keystore:generate

# Método manual
keytool -genkey -v -keystore android/keystores/victus-release-key.keystore \
  -alias victus-key -keyalg RSA -keysize 2048 -validity 9125 \
  -dname "CN=Victus App, OU=Development, O=Victus, L=Ciudad, ST=Estado, C=ES"
```

### Paso 2: Configurar build.gradle
El archivo `android/app/build.gradle` ya está configurado para leer automáticamente:

```gradle
// Cargar propiedades del keystore
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Paso 3: Crear keystore.properties
```properties
# ⚠️ NUNCA subir este archivo a Git
storeFile=android/keystores/victus-release-key.keystore
storePassword=TU_CONTRASEÑA_KEYSTORE
keyAlias=victus-key
keyPassword=TU_CONTRASEÑA_CLAVE
```

## 🚀 Scripts Automatizados

### Generación de Keystore
```bash
# Generar keystore interactivamente
npm run keystore:generate
```

### Build y Firma
```bash
# Build completo con firma (producción)
npm run apk:release

# Build de desarrollo
npm run apk:debug

# Build limpio
npm run build:clean && npm run apk:release
```

### Verificación
```bash
# Verificar APK firmado
npm run apk:verify

# Verificar APK específico
npm run apk:verify /ruta/al/archivo.apk
```

## 🔍 Verificación Manual

### Verificar Firma
```bash
# Verificar que el APK esté firmado
jarsigner -verify -verbose -certs app-release.apk

# Verificar información del keystore
keytool -list -v -keystore android/keystores/victus-release-key.keystore
```

### Verificar Información del APK
```bash
# Información del paquete
aapt dump badging app-release.apk

# Verificar alineación
zipalign -c -v 4 app-release.apk
```

## 📋 Proceso Completo de Publicación

### 1. Preparación
```bash
# Limpiar builds anteriores
npm run build:clean

# Verificar configuración
npm run keystore:verify
```

### 2. Build de Producción
```bash
# Build automático con firma
npm run apk:release
```

### 3. Verificación
```bash
# Verificar APK generado
npm run apk:verify
```

### 4. Publicación
```bash
# El APK estará en: android/app/build/outputs/apk/release/
# También se copia a: dist/victus-release-TIMESTAMP.apk
```

## 🛠️ Troubleshooting

### Error: "jarsigner: command not found"
```bash
# Instalar Java JDK
# Windows: Descargar desde Oracle o usar winget
winget install Oracle.JDK.17

# Verificar instalación
java -version
keytool -help
```

### Error: "Keystore not found"
```bash
# Verificar que el keystore existe
ls -la android/keystores/

# Regenerar si es necesario
npm run keystore:generate
```

### Error: "Wrong password"
```bash
# Verificar archivo keystore.properties
cat android/keystore.properties

# Asegurar que las contraseñas coincidan
```

## 📱 Formatos de Salida

### APK (Android Package)
- ✅ **Uso**: Instalación directa, pruebas, distribución alternativa
- 📍 **Ubicación**: `android/app/build/outputs/apk/release/`
- 🔧 **Comando**: `npm run apk:release`

### AAB (Android App Bundle)
Para Google Play Store, usar AAB en lugar de APK:

```bash
# Generar AAB
cd android && ./gradlew bundleRelease

# Ubicación: android/app/build/outputs/bundle/release/
```

## 🔐 Seguridad y Backup

### Información Crítica a Guardar
```bash
# 1. Keystore file
cp android/keystores/victus-release-key.keystore ~/backup/

# 2. Contraseñas (guardar en lugar seguro)
# - storePassword
# - keyPassword
# - keyAlias

# 3. Información del keystore
keytool -list -v -keystore android/keystores/victus-release-key.keystore > keystore-info.txt
```

### Mejores Prácticas
- 🔒 **Nunca** subir keystores a Git
- 💾 **Siempre** hacer backup de keystores
- 🔐 **Usar** contraseñas seguras
- 📝 **Documentar** las contraseñas en lugar seguro
- 🔄 **Probar** el proceso en desarrollo
```bash
# Usar keytool (incluido en Java JDK)
keytool -genkey -v -keystore victus-release-key.keystore -alias victus-key -keyalg RSA -keysize 2048 -validity 10000
```

**Información que te pedirá:**
- 🔐 **Contraseña del keystore**: Elige una segura
- 🔐 **Contraseña del alias**: Puede ser la misma
- 👤 **Nombre y apellido**: Tu nombre
- 🏢 **Organización**: Nombre de tu empresa/proyecto
- 🌎 **Ciudad, Estado, País**: Tu ubicación

### Paso 2: Configurar keystore.properties
```properties
storePassword=TU_PASSWORD_KEYSTORE
keyPassword=TU_PASSWORD_ALIAS
keyAlias=victus-key
storeFile=../keystores/victus-release-key.keystore
```

### Paso 3: Configurar build.gradle
```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 📱 Comandos de Build

### Build Debug (Firmado automáticamente)
```bash
npx ionic capacitor build android
```

### Build Release (Firmado con tu keystore)
```bash
npx ionic capacitor build android --prod --release
cd android
./gradlew assembleRelease
```

## 🔒 Seguridad del Keystore

### ✅ Buenas Prácticas
- 📁 **Guarda copias** en múltiples ubicaciones seguras
- 🔐 **Usa contraseñas fuertes**
- 🚫 **NO subas a Git** el keystore ni las contraseñas
- 📝 **Documenta** la información en lugar seguro
- ☁️ **Backup en la nube** (cifrado)

### ❌ Qué NO hacer
- 🚫 NO compartas el keystore
- 🚫 NO lo subas a repositorios públicos
- 🚫 NO uses contraseñas simples
- 🚫 NO olvides hacer backup

## 🎯 Verificar la Firma

### Verificar APK firmado
```bash
# Ver información de firma
jarsigner -verify -verbose -certs miApp-release-signed.apk

# Ver certificado
keytool -printcert -jarfile miApp-release-signed.apk
```

### Información que verás
```
Signer #1:
- Signature algorithm: SHA256withRSA
- Owner: CN=Tu Nombre, O=Tu Organización
- Issuer: CN=Tu Nombre, O=Tu Organización
- Valid from: [fecha] until: [fecha]
```

## 🔄 Proceso Completo de Publicación

### 1. Desarrollo
```bash
ionic serve                    # Desarrollo web
ionic capacitor run android   # Pruebas en emulador/dispositivo
```

### 2. Build de Producción
```bash
ionic build --prod           # Build optimizado
ionic capacitor build android --prod --release
```

### 3. Firma Manual (si es necesario)
```bash
# Si el gradlew no firmó automáticamente
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore victus-release-key.keystore miApp-release-unsigned.apk victus-key

# Alinear el APK
zipalign -v 4 miApp-release-unsigned.apk miApp-release-signed.apk
```

### 4. Subir a Play Store
- 📤 Sube el APK/AAB firmado
- ✅ Google verifica la firma
- 🚀 Publicación exitosa

## ⚠️ Troubleshooting

### Error: "App not installed"
- **Causa**: Firma diferente a versión anterior
- **Solución**: Desinstalar versión anterior

### Error: "keystore not found"
- **Causa**: Ruta incorrecta en configuración
- **Solución**: Verificar ruta en keystore.properties

### Error: "wrong password"
- **Causa**: Contraseña incorrecta
- **Solución**: Verificar contraseñas en configuración

## 📝 Checklist de Firma

### Antes de Publicar
- [ ] ✅ Keystore de release generado
- [ ] ✅ keystore.properties configurado
- [ ] ✅ build.gradle configurado
- [ ] ✅ Backup del keystore guardado
- [ ] ✅ Contraseñas documentadas (lugar seguro)
- [ ] ✅ APK buildado y firmado
- [ ] ✅ Firma verificada con jarsigner
- [ ] ✅ App probada en dispositivo real

### Después de Publicar
- [ ] ✅ Keystore guardado en múltiples ubicaciones
- [ ] ✅ Información de firma documentada
- [ ] ✅ Proceso de build documentado
- [ ] ✅ Scripts de automatización creados

---

*Esta guía te ayudará a firmar correctamente tu app Victus para publicación en Google Play Store*
