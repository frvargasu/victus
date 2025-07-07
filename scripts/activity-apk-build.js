#!/usr/bin/env node

/**
 * Script para generar APK siguiendo las especificaciones de la actividad
 * Cumple con los requisitos específicos de "Testeando y firmando mi App"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ActivityAPKBuilder {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      activity: 'Testeando y firmando mi App',
      steps: {
        environmentCheck: { status: 'pending', details: {} },
        cordovaBuild: { status: 'pending', details: {} },
        apkGeneration: { status: 'pending', details: {} },
        apkLocation: { status: 'pending', details: {} }
      },
      summary: {
        success: false,
        errors: [],
        warnings: [],
        apkPath: null
      }
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    console.log(`${prefix} ${message}`);
    
    if (level === 'error') {
      this.results.summary.errors.push(message);
    } else if (level === 'warn') {
      this.results.summary.warnings.push(message);
    }
  }

  async runCommand(command, options = {}) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });
      return { success: true, output };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkEnvironment() {
    this.log('🔍 Verificando configuración del entorno de desarrollo...');
    
    const checks = {
      jdkPath: false,
      sdkPath: false,
      javaVersion: null,
      androidSDK: null
    };

    // Verificar JDK Path
    const javaHome = process.env.JAVA_HOME;
    if (javaHome && fs.existsSync(javaHome)) {
      checks.jdkPath = true;
      this.log(`✅ JDK Path verificado: ${javaHome}`);
    } else {
      this.log('❌ JDK Path no encontrado o inválido', 'error');
    }

    // Verificar SDK Path
    const androidSDK = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
    if (androidSDK && fs.existsSync(androidSDK)) {
      checks.sdkPath = true;
      checks.androidSDK = androidSDK;
      this.log(`✅ SDK Path verificado: ${androidSDK}`);
    } else {
      this.log('❌ SDK Path no encontrado o inválido', 'error');
    }

    // Verificar versión de Java
    const javaResult = await this.runCommand('java -version');
    if (javaResult.success) {
      checks.javaVersion = javaResult.output || javaResult.error; // java -version envía a stderr
      this.log(`✅ Java disponible`);
    } else {
      this.log('❌ Java no disponible', 'error');
    }

    this.results.steps.environmentCheck = {
      status: (checks.jdkPath && checks.sdkPath) ? 'success' : 'failed',
      details: checks
    };

    return checks.jdkPath && checks.sdkPath;
  }

  async executeCordovaIonicBuild() {
    this.log('🔨 Ejecutando comando de build de Cordova Ionic tipo release para Android...');
    
    try {
      // Primer paso: Build de Ionic
      this.log('📦 Paso 1: Ejecutando ionic build...');
      const ionicBuildResult = await this.runCommand('ionic build --prod');
      
      if (!ionicBuildResult.success) {
        throw new Error(`Ionic build falló: ${ionicBuildResult.error}`);
      }

      // Segundo paso: Capacitor sync
      this.log('🔄 Paso 2: Sincronizando con Capacitor...');
      const syncResult = await this.runCommand('npx cap sync android');
      
      if (!syncResult.success) {
        throw new Error(`Capacitor sync falló: ${syncResult.error}`);
      }

      // Tercer paso: Build de Android release
      this.log('🤖 Paso 3: Ejecutando build de Android release...');
      const androidBuildResult = await this.runCommand('cd android && ./gradlew assembleRelease', {
        cwd: process.cwd()
      });
      
      if (!androidBuildResult.success) {
        throw new Error(`Android build falló: ${androidBuildResult.error}`);
      }

      this.results.steps.cordovaBuild = {
        status: 'success',
        details: {
          ionicBuild: 'success',
          capacitorSync: 'success',
          androidBuild: 'success'
        }
      };

      this.log('✅ Build de Cordova Ionic completado exitosamente');
      return true;

    } catch (error) {
      this.log(`❌ Error en build de Cordova Ionic: ${error.message}`, 'error');
      this.results.steps.cordovaBuild = {
        status: 'failed',
        details: { error: error.message }
      };
      return false;
    }
  }

  async generateAPK() {
    this.log('📱 Generando APK...');
    
    try {
      // Verificar que se haya ejecutado el build
      const releaseApkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
      
      if (fs.existsSync(releaseApkPath)) {
        this.log('✅ APK generado correctamente');
        
        // Obtener información del APK
        const apkStats = fs.statSync(releaseApkPath);
        const apkSize = Math.round(apkStats.size / 1024 / 1024 * 100) / 100; // MB
        
        this.results.steps.apkGeneration = {
          status: 'success',
          details: {
            path: releaseApkPath,
            size: `${apkSize} MB`,
            created: apkStats.birthtime
          }
        };
        
        this.results.summary.apkPath = releaseApkPath;
        this.log(`📦 APK generado: ${releaseApkPath} (${apkSize} MB)`);
        
        return true;
      } else {
        throw new Error('APK no encontrado en la ruta esperada');
      }
      
    } catch (error) {
      this.log(`❌ Error generando APK: ${error.message}`, 'error');
      this.results.steps.apkGeneration = {
        status: 'failed',
        details: { error: error.message }
      };
      return false;
    }
  }

  async locateAPK() {
    this.log('🔍 Ubicando APK en el explorador...');
    
    try {
      const apkPath = this.results.summary.apkPath;
      
      if (!apkPath) {
        throw new Error('No se generó APK exitosamente');
      }

      const absolutePath = path.resolve(apkPath);
      const directory = path.dirname(absolutePath);
      
      this.log(`📁 Ruta del APK: ${absolutePath}`);
      this.log(`📂 Directorio: ${directory}`);
      
      // Verificar que el archivo existe
      if (fs.existsSync(absolutePath)) {
        this.results.steps.apkLocation = {
          status: 'success',
          details: {
            absolutePath: absolutePath,
            directory: directory,
            relativePath: apkPath,
            exists: true
          }
        };
        
        this.log('✅ APK ubicado exitosamente');
        return true;
      } else {
        throw new Error('APK no encontrado en la ruta especificada');
      }
      
    } catch (error) {
      this.log(`❌ Error ubicando APK: ${error.message}`, 'error');
      this.results.steps.apkLocation = {
        status: 'failed',
        details: { error: error.message }
      };
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 Generando reporte de la actividad...');
    
    const allStepsSuccess = Object.values(this.results.steps).every(step => step.status === 'success');
    this.results.summary.success = allStepsSuccess;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE DE ACTIVIDAD: Testeando y firmando mi App');
    console.log('='.repeat(60));
    
    console.log('\n🔍 Verificación de Entorno:');
    console.log(`   Estado: ${this.results.steps.environmentCheck.status}`);
    
    console.log('\n🔨 Build de Cordova Ionic:');
    console.log(`   Estado: ${this.results.steps.cordovaBuild.status}`);
    
    console.log('\n📱 Generación de APK:');
    console.log(`   Estado: ${this.results.steps.apkGeneration.status}`);
    if (this.results.summary.apkPath) {
      console.log(`   Ruta: ${this.results.summary.apkPath}`);
    }
    
    console.log('\n📂 Ubicación de APK:');
    console.log(`   Estado: ${this.results.steps.apkLocation.status}`);
    
    console.log('\n📈 Resumen Final:');
    console.log(`   ✅ Éxito: ${allStepsSuccess ? 'SÍ' : 'NO'}`);
    console.log(`   ❌ Errores: ${this.results.summary.errors.length}`);
    console.log(`   ⚠️ Advertencias: ${this.results.summary.warnings.length}`);
    
    if (this.results.summary.errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      this.results.summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.results.summary.warnings.length > 0) {
      console.log('\n⚠️ Advertencias:');
      this.results.summary.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Guardar reporte
    const reportPath = 'activity-apk-build-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`💾 Reporte guardado en: ${reportPath}`);
  }

  async run() {
    console.log('🚀 Iniciando actividad: Testeando y firmando mi App');
    console.log('=' + '='.repeat(60));
    
    try {
      // Paso 1: Verificar entorno
      const envOk = await this.checkEnvironment();
      if (!envOk) {
        this.log('❌ Verificación de entorno falló. No se puede continuar.', 'error');
        this.generateReport();
        return this.results;
      }
      
      // Paso 2: Ejecutar build de Cordova Ionic
      const buildOk = await this.executeCordovaIonicBuild();
      if (!buildOk) {
        this.log('❌ Build de Cordova Ionic falló. No se puede continuar.', 'error');
        this.generateReport();
        return this.results;
      }
      
      // Paso 3: Generar APK
      const apkOk = await this.generateAPK();
      if (!apkOk) {
        this.log('❌ Generación de APK falló. No se puede continuar.', 'error');
        this.generateReport();
        return this.results;
      }
      
      // Paso 4: Ubicar APK
      await this.locateAPK();
      
      // Generar reporte final
      this.generateReport();
      
      if (this.results.summary.success) {
        this.log('\n🎉 Actividad completada exitosamente!');
        this.log(`📱 APK generado en: ${this.results.summary.apkPath}`);
      } else {
        this.log('\n❌ Actividad completada con errores');
      }
      
    } catch (error) {
      this.log(`❌ Error inesperado: ${error.message}`, 'error');
      this.generateReport();
    }
    
    return this.results;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const builder = new ActivityAPKBuilder();
  builder.run().then(results => {
    process.exit(results.summary.success ? 0 : 1);
  }).catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

module.exports = ActivityAPKBuilder;
