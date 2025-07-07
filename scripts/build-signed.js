#!/usr/bin/env node

/**
 * 🚀 Script para build y firma automática de APK
 * Proyecto: Victus App
 * 
 * Uso: node scripts/build-signed.js [--debug|--release]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SignedBuilder {
  constructor() {
    this.mode = this.parseArgs();
    this.projectRoot = process.cwd();
  }

  /**
   * Parsea argumentos de línea de comandos
   */
  parseArgs() {
    const args = process.argv.slice(2);
    if (args.includes('--debug')) return 'debug';
    if (args.includes('--release')) return 'release';
    return 'release'; // Por defecto release
  }

  /**
   * Verifica prerequisitos
   */
  checkPrerequisites() {
    const checks = [
      { name: 'ionic', command: 'ionic --version' },
      { name: 'capacitor', command: 'npx cap --version' },
      { name: 'gradle', command: 'gradle --version' }
    ];

    console.log('🔍 Verificando prerequisitos...');
    
    for (const check of checks) {
      try {
        execSync(check.command, { stdio: 'ignore' });
        console.log(`   ✅ ${check.name} disponible`);
      } catch (error) {
        console.error(`   ❌ ${check.name} no disponible`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica configuración de firma
   */
  checkSigningConfig() {
    if (this.mode === 'debug') {
      return true; // Debug usa keystore automático
    }

    const keystorePropsPath = path.join(this.projectRoot, 'android/keystore.properties');
    
    if (!fs.existsSync(keystorePropsPath)) {
      console.error('❌ Archivo keystore.properties no encontrado');
      console.log('💡 Ejecuta: npm run keystore:generate');
      return false;
    }

    // Verificar contenido del archivo
    const props = fs.readFileSync(keystorePropsPath, 'utf-8');
    const requiredProps = ['storeFile', 'storePassword', 'keyAlias', 'keyPassword'];
    
    for (const prop of requiredProps) {
      if (!props.includes(prop)) {
        console.error(`❌ Propiedad ${prop} no encontrada en keystore.properties`);
        return false;
      }
    }

    console.log('✅ Configuración de firma verificada');
    return true;
  }

  /**
   * Limpia builds anteriores
   */
  cleanBuild() {
    console.log('🧹 Limpiando builds anteriores...');
    
    try {
      // Limpiar www
      if (fs.existsSync('www')) {
        execSync('rm -rf www', { stdio: 'inherit' });
      }
      
      // Limpiar build de Android
      if (fs.existsSync('android/app/build')) {
        execSync('rm -rf android/app/build', { stdio: 'inherit' });
      }
      
      console.log('✅ Limpieza completada');
    } catch (error) {
      console.warn('⚠️ Advertencia durante limpieza:', error.message);
    }
  }

  /**
   * Construye la aplicación web
   */
  buildWeb() {
    console.log('🔨 Construyendo aplicación web...');
    
    try {
      const buildCommand = this.mode === 'debug' 
        ? 'ionic build' 
        : 'ionic build --prod';
      
      execSync(buildCommand, { stdio: 'inherit' });
      console.log('✅ Build web completado');
    } catch (error) {
      console.error('❌ Error en build web:', error.message);
      throw error;
    }
  }

  /**
   * Sincroniza con Capacitor
   */
  syncCapacitor() {
    console.log('🔄 Sincronizando con Capacitor...');
    
    try {
      execSync('npx cap sync android', { stdio: 'inherit' });
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      throw error;
    }
  }

  /**
   * Construye APK
   */
  buildApk() {
    console.log(`📦 Construyendo APK (${this.mode})...`);
    
    try {
      const buildCommand = this.mode === 'debug'
        ? 'cd android && ./gradlew assembleDebug'
        : 'cd android && ./gradlew assembleRelease';
      
      execSync(buildCommand, { stdio: 'inherit' });
      console.log('✅ APK construido exitosamente');
    } catch (error) {
      console.error('❌ Error construyendo APK:', error.message);
      throw error;
    }
  }

  /**
   * Encuentra el APK generado
   */
  findGeneratedApk() {
    const apkDir = `android/app/build/outputs/apk/${this.mode}`;
    
    if (!fs.existsSync(apkDir)) {
      throw new Error(`Directorio APK no encontrado: ${apkDir}`);
    }

    const files = fs.readdirSync(apkDir);
    const apkFile = files.find(file => file.endsWith('.apk'));
    
    if (!apkFile) {
      throw new Error(`APK no encontrado en ${apkDir}`);
    }

    return path.join(apkDir, apkFile);
  }

  /**
   * Verifica el APK generado
   */
  verifyApk() {
    console.log('🔍 Verificando APK...');
    
    try {
      const apkPath = this.findGeneratedApk();
      
      // Ejecutar script de verificación
      const VerifyApk = require('./verify-apk.js');
      const verifier = new VerifyApk();
      verifier.apkPath = apkPath;
      
      const report = verifier.generateSecurityReport();
      
      if (this.mode === 'release' && !report.signature.verified) {
        console.error('❌ APK de release no está firmado correctamente');
        return false;
      }
      
      console.log('✅ Verificación completada');
      return true;
    } catch (error) {
      console.error('❌ Error en verificación:', error.message);
      return false;
    }
  }

  /**
   * Copia APK a directorio de salida
   */
  copyApkToOutput() {
    console.log('📋 Copiando APK a directorio de salida...');
    
    try {
      const apkPath = this.findGeneratedApk();
      const outputDir = 'dist';
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 15);
      const outputName = `victus-${this.mode}-${timestamp}.apk`;
      const outputPath = path.join(outputDir, outputName);
      
      execSync(`cp "${apkPath}" "${outputPath}"`);
      
      console.log(`✅ APK copiado a: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('❌ Error copiando APK:', error.message);
      return null;
    }
  }

  /**
   * Muestra resumen del build
   */
  showSummary(outputPath) {
    console.log('\n🎉 Build Completado');
    console.log('===================');
    console.log(`📦 Modo: ${this.mode}`);
    console.log(`📄 APK: ${outputPath || 'En directorio de build'}`);
    console.log(`⏱️  Tiempo: ${new Date().toLocaleString()}`);
    
    if (this.mode === 'release') {
      console.log('\n🚀 Siguiente paso: Subir a Google Play Store');
    } else {
      console.log('\n🔧 APK listo para pruebas');
    }
  }

  /**
   * Proceso principal
   */
  async run() {
    console.log(`🚀 Build Automático - Victus App (${this.mode})`);
    console.log('============================================\n');

    try {
      // Verificaciones previas
      if (!this.checkPrerequisites()) {
        process.exit(1);
      }

      if (!this.checkSigningConfig()) {
        process.exit(1);
      }

      // Proceso de build
      this.cleanBuild();
      this.buildWeb();
      this.syncCapacitor();
      this.buildApk();
      
      // Verificación y output
      if (!this.verifyApk()) {
        console.warn('⚠️ Advertencia: Verificación falló, pero APK fue generado');
      }
      
      const outputPath = this.copyApkToOutput();
      this.showSummary(outputPath);
      
      console.log('\n✅ Proceso completado exitosamente');
      
    } catch (error) {
      console.error('\n❌ Error durante el build:', error.message);
      process.exit(1);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const builder = new SignedBuilder();
  builder.run();
}

module.exports = SignedBuilder;
