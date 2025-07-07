#!/usr/bin/env node

/**
 * 📦 Script para generar App Bundle (.aab)
 * Proyecto: Victus App
 * 
 * Los archivos .aab son el formato requerido por Google Play Store
 * Uso: node scripts/generate-aab.js [--debug|--release]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AabGenerator {
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
   * Verifica configuración de firma para release
   */
  checkSigningConfig() {
    if (this.mode === 'debug') {
      return true; // Debug no requiere configuración especial
    }

    const keystorePropsPath = path.join(this.projectRoot, 'android/keystore.properties');
    
    if (!fs.existsSync(keystorePropsPath)) {
      console.error('❌ Archivo keystore.properties no encontrado');
      console.log('💡 Ejecuta: npm run keystore:generate');
      return false;
    }

    console.log('✅ Configuración de firma verificada');
    return true;
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
   * Genera el App Bundle (.aab)
   */
  generateAab() {
    console.log(`📦 Generando App Bundle (.aab) - ${this.mode}...`);
    
    try {
      const bundleCommand = this.mode === 'debug'
        ? 'cd android && ./gradlew bundleDebug'
        : 'cd android && ./gradlew bundleRelease';
      
      execSync(bundleCommand, { stdio: 'inherit' });
      console.log('✅ App Bundle generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando App Bundle:', error.message);
      throw error;
    }
  }

  /**
   * Encuentra el archivo .aab generado
   */
  findGeneratedAab() {
    const aabDir = `android/app/build/outputs/bundle/${this.mode}`;
    
    if (!fs.existsSync(aabDir)) {
      throw new Error(`Directorio AAB no encontrado: ${aabDir}`);
    }

    const files = fs.readdirSync(aabDir);
    const aabFile = files.find(file => file.endsWith('.aab'));
    
    if (!aabFile) {
      throw new Error(`Archivo .aab no encontrado en ${aabDir}`);
    }

    return path.join(aabDir, aabFile);
  }

  /**
   * Copia AAB a directorio de salida
   */
  copyAabToOutput() {
    console.log('📋 Copiando AAB a directorio de salida...');
    
    try {
      const aabPath = this.findGeneratedAab();
      const outputDir = 'dist';
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 15);
      const outputName = `victus-${this.mode}-${timestamp}.aab`;
      const outputPath = path.join(outputDir, outputName);
      
      fs.copyFileSync(aabPath, outputPath);
      
      console.log(`✅ AAB copiado a: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('❌ Error copiando AAB:', error.message);
      return null;
    }
  }

  /**
   * Obtiene información del AAB
   */
  getAabInfo(aabPath) {
    try {
      const stats = fs.statSync(aabPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      return {
        path: aabPath,
        size: `${sizeInMB} MB`,
        modified: stats.mtime.toLocaleString()
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica el contenido del AAB
   */
  verifyAab(aabPath) {
    console.log('🔍 Verificando App Bundle...');
    
    try {
      // Verificar que el archivo existe y tiene contenido
      const stats = fs.statSync(aabPath);
      if (stats.size === 0) {
        console.warn('⚠️ El archivo AAB está vacío');
        return false;
      }

      // Verificar extensión
      if (!aabPath.endsWith('.aab')) {
        console.warn('⚠️ El archivo no tiene extensión .aab');
        return false;
      }

      console.log('✅ App Bundle verificado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error verificando AAB:', error.message);
      return false;
    }
  }

  /**
   * Muestra resumen del proceso
   */
  showSummary(outputPath) {
    console.log('\n🎉 Generación de App Bundle Completada');
    console.log('======================================');
    console.log(`📦 Modo: ${this.mode}`);
    console.log(`📄 AAB: ${outputPath || 'En directorio de build'}`);
    console.log(`⏱️  Tiempo: ${new Date().toLocaleString()}`);
    
    if (outputPath) {
      const info = this.getAabInfo(outputPath);
      if (info) {
        console.log(`📏 Tamaño: ${info.size}`);
      }
    }
    
    console.log('\n📚 Información importante:');
    console.log('   📱 Los archivos .aab son el formato requerido por Google Play Store');
    console.log('   🔄 Google Play genera APK optimizados para cada dispositivo');
    console.log('   📊 Reduce el tamaño de descarga hasta un 15%');
    
    if (this.mode === 'release') {
      console.log('\n🚀 Siguiente paso: Subir a Google Play Console');
      console.log('   1. Ir a https://play.google.com/console');
      console.log('   2. Crear nueva versión');
      console.log('   3. Subir el archivo .aab');
      console.log('   4. Completar información de la versión');
    } else {
      console.log('\n🔧 AAB de debug listo para pruebas internas');
    }
  }

  /**
   * Proceso principal
   */
  async run() {
    console.log(`📦 Generador de App Bundle - Victus App (${this.mode})`);
    console.log('=================================================\n');

    try {
      // Verificaciones previas
      if (!this.checkPrerequisites()) {
        process.exit(1);
      }

      if (!this.checkSigningConfig()) {
        process.exit(1);
      }

      // Proceso de generación
      this.buildWeb();
      this.syncCapacitor();
      this.generateAab();
      
      // Verificación y output
      const aabPath = this.findGeneratedAab();
      if (!this.verifyAab(aabPath)) {
        console.warn('⚠️ Advertencia: Verificación del AAB falló');
      }
      
      const outputPath = this.copyAabToOutput();
      this.showSummary(outputPath);
      
      console.log('\n✅ Proceso completado exitosamente');
      
    } catch (error) {
      console.error('\n❌ Error durante la generación:', error.message);
      process.exit(1);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new AabGenerator();
  generator.run();
}

module.exports = AabGenerator;
