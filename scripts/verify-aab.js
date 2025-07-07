#!/usr/bin/env node

/**
 * 🔍 Script para verificar App Bundle (.aab)
 * Proyecto: Victus App
 * 
 * Uso: node scripts/verify-aab.js [ruta-del-aab]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AabVerifier {
  constructor() {
    this.aabPath = process.argv[2] || this.findLatestAab();
  }

  /**
   * Busca el AAB más reciente
   */
  findLatestAab() {
    const aabDirs = [
      'android/app/build/outputs/bundle/release',
      'android/app/build/outputs/bundle/debug',
      'dist'
    ];

    let latestAab = null;
    let latestTime = 0;

    for (const dir of aabDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.aab')) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.mtime > latestTime) {
              latestTime = stats.mtime;
              latestAab = filePath;
            }
          }
        }
      }
    }

    return latestAab;
  }

  /**
   * Verifica si bundletool está disponible
   */
  checkBundletool() {
    try {
      execSync('bundletool version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.warn('⚠️ bundletool no está disponible. Algunas verificaciones serán limitadas.');
      console.log('💡 Instala bundletool: npm install -g @android/bundletool');
      return false;
    }
  }

  /**
   * Obtiene información básica del AAB
   */
  getAabInfo() {
    if (!fs.existsSync(this.aabPath)) {
      throw new Error(`AAB no encontrado: ${this.aabPath}`);
    }

    const stats = fs.statSync(this.aabPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    return {
      path: this.aabPath,
      size: `${sizeInMB} MB`,
      modified: stats.mtime.toLocaleString(),
      exists: true
    };
  }

  /**
   * Verifica la estructura del AAB
   */
  verifyAabStructure() {
    try {
      // Verificar que es un archivo ZIP válido (AAB es básicamente un ZIP)
      const result = execSync(`unzip -l "${this.aabPath}"`, { encoding: 'utf-8' });
      
      const requiredFiles = [
        'BundleConfig.pb',
        'base/manifest/AndroidManifest.xml',
        'base/dex/',
        'base/res/'
      ];

      const missingFiles = [];
      requiredFiles.forEach(file => {
        if (!result.includes(file)) {
          missingFiles.push(file);
        }
      });

      return {
        valid: missingFiles.length === 0,
        missingFiles: missingFiles,
        structure: result
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Extrae información del manifiesto
   */
  extractManifestInfo() {
    try {
      // Usar aapt para extraer información del manifiesto
      const result = execSync(`aapt dump badging "${this.aabPath}"`, { encoding: 'utf-8' });
      
      const lines = result.split('\n');
      const manifestInfo = {};

      lines.forEach(line => {
        if (line.startsWith('package:')) {
          const nameMatch = line.match(/name='([^']+)'/);
          const versionCodeMatch = line.match(/versionCode='([^']+)'/);
          const versionNameMatch = line.match(/versionName='([^']+)'/);
          
          if (nameMatch) manifestInfo.packageName = nameMatch[1];
          if (versionCodeMatch) manifestInfo.versionCode = versionCodeMatch[1];
          if (versionNameMatch) manifestInfo.versionName = versionNameMatch[1];
        }
        
        if (line.startsWith('application-label:')) {
          const labelMatch = line.match(/application-label:'([^']+)'/);
          if (labelMatch) manifestInfo.appLabel = labelMatch[1];
        }

        if (line.startsWith('sdkVersion:')) {
          const sdkMatch = line.match(/sdkVersion:'([^']+)'/);
          if (sdkMatch) manifestInfo.minSdkVersion = sdkMatch[1];
        }

        if (line.startsWith('targetSdkVersion:')) {
          const targetMatch = line.match(/targetSdkVersion:'([^']+)'/);
          if (targetMatch) manifestInfo.targetSdkVersion = targetMatch[1];
        }
      });

      return manifestInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Verifica los módulos del AAB
   */
  verifyAabModules() {
    try {
      if (!this.checkBundletool()) {
        return null;
      }

      const result = execSync(`bundletool dump manifest --bundle="${this.aabPath}"`, 
        { encoding: 'utf-8' });
      
      return {
        hasModules: result.includes('<module'),
        manifest: result
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Estima el tamaño de descarga
   */
  estimateDownloadSize() {
    try {
      if (!this.checkBundletool()) {
        return null;
      }

      const result = execSync(`bundletool get-size total --bundle="${this.aabPath}"`, 
        { encoding: 'utf-8' });
      
      return {
        estimatedSize: result.trim()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Genera reporte completo
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      aabInfo: this.getAabInfo(),
      structure: this.verifyAabStructure(),
      manifest: this.extractManifestInfo(),
      modules: this.verifyAabModules(),
      downloadSize: this.estimateDownloadSize()
    };

    return report;
  }

  /**
   * Muestra el reporte en consola
   */
  displayReport(report) {
    console.log('🔍 Reporte de Verificación AAB - Victus App');
    console.log('==========================================\n');

    // Información del AAB
    console.log('📦 Información del App Bundle:');
    console.log(`   📄 Archivo: ${report.aabInfo.path}`);
    console.log(`   📏 Tamaño: ${report.aabInfo.size}`);
    console.log(`   📅 Modificado: ${report.aabInfo.modified}\n`);

    // Información del manifiesto
    if (report.manifest && !report.manifest.error) {
      console.log('📋 Información del Manifiesto:');
      console.log(`   📦 Paquete: ${report.manifest.packageName || 'N/A'}`);
      console.log(`   🏷️  Aplicación: ${report.manifest.appLabel || 'N/A'}`);
      console.log(`   🔢 Versión: ${report.manifest.versionName || 'N/A'} (${report.manifest.versionCode || 'N/A'})`);
      console.log(`   📱 SDK Min: ${report.manifest.minSdkVersion || 'N/A'}`);
      console.log(`   🎯 SDK Target: ${report.manifest.targetSdkVersion || 'N/A'}\n`);
    }

    // Estructura del AAB
    console.log('🏗️  Estructura del AAB:');
    if (report.structure.valid) {
      console.log('   ✅ Estructura válida');
    } else {
      console.log('   ❌ Estructura inválida');
      if (report.structure.missingFiles) {
        console.log('   📋 Archivos faltantes:');
        report.structure.missingFiles.forEach(file => {
          console.log(`      ❌ ${file}`);
        });
      }
    }

    // Tamaño de descarga estimado
    if (report.downloadSize && !report.downloadSize.error) {
      console.log('\n📊 Tamaño de Descarga Estimado:');
      console.log(`   📱 ${report.downloadSize.estimatedSize}`);
    }

    // Verificaciones
    console.log('\n✅ Verificaciones:');
    console.log(`   📦 Archivo existe: ${report.aabInfo.exists ? '✅' : '❌'}`);
    console.log(`   🏗️  Estructura válida: ${report.structure.valid ? '✅' : '❌'}`);
    console.log(`   📋 Manifiesto legible: ${report.manifest && !report.manifest.error ? '✅' : '❌'}`);

    // Recomendaciones
    console.log('\n💡 Recomendaciones:');
    
    if (!report.structure.valid) {
      console.log('   🔴 CRÍTICO: Estructura del AAB inválida');
    }
    
    if (report.manifest && report.manifest.error) {
      console.log('   🟡 ADVERTENCIA: No se pudo leer el manifiesto');
    }
    
    if (report.structure.valid && report.manifest && !report.manifest.error) {
      console.log('   ✅ El AAB está listo para Google Play Store');
    }
  }

  /**
   * Guarda el reporte
   */
  saveReport(report) {
    const reportPath = `android/aab-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  }

  /**
   * Proceso principal
   */
  async run() {
    try {
      if (!this.aabPath) {
        console.error('❌ No se encontró ningún AAB para verificar');
        console.log('💡 Uso: node scripts/verify-aab.js [ruta-del-aab]');
        process.exit(1);
      }

      // Generar y mostrar reporte
      const report = this.generateReport();
      this.displayReport(report);
      this.saveReport(report);

      // Código de salida basado en el resultado
      if (!report.structure.valid) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const verifier = new AabVerifier();
  verifier.run();
}

module.exports = AabVerifier;
