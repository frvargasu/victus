#!/usr/bin/env node

/**
 * 🔍 Script para verificar APK firmado
 * Proyecto: Victus App
 * 
 * Uso: node scripts/verify-apk.js [ruta-del-apk]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ApkVerifier {
  constructor() {
    this.apkPath = process.argv[2] || this.findLatestApk();
  }

  /**
   * Busca el APK más reciente
   */
  findLatestApk() {
    const apkDirs = [
      'android/app/build/outputs/apk/release',
      'android/app/build/outputs/apk/debug'
    ];

    let latestApk = null;
    let latestTime = 0;

    for (const dir of apkDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.apk')) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.mtime > latestTime) {
              latestTime = stats.mtime;
              latestApk = filePath;
            }
          }
        }
      }
    }

    return latestApk;
  }

  /**
   * Verifica si aapt está disponible
   */
  checkAapt() {
    try {
      execSync('aapt version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.warn('⚠️ aapt no está disponible. Algunas verificaciones serán limitadas.');
      return false;
    }
  }

  /**
   * Verifica si jarsigner está disponible
   */
  checkJarsigner() {
    try {
      execSync('jarsigner -help', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('❌ jarsigner no está disponible. Instala Java JDK.');
      return false;
    }
  }

  /**
   * Obtiene información básica del APK
   */
  getApkInfo() {
    if (!fs.existsSync(this.apkPath)) {
      throw new Error(`APK no encontrado: ${this.apkPath}`);
    }

    const stats = fs.statSync(this.apkPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    return {
      path: this.apkPath,
      size: `${sizeInMB} MB`,
      modified: stats.mtime.toLocaleString(),
      exists: true
    };
  }

  /**
   * Verifica la firma del APK
   */
  verifySignature() {
    try {
      const result = execSync(`jarsigner -verify -verbose -certs "${this.apkPath}"`, 
        { encoding: 'utf-8' });
      
      const lines = result.split('\n');
      const isVerified = lines.some(line => line.includes('jar verified'));
      
      return {
        verified: isVerified,
        details: result
      };
    } catch (error) {
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene información del paquete (si aapt está disponible)
   */
  getPackageInfo() {
    if (!this.checkAapt()) {
      return null;
    }

    try {
      const result = execSync(`aapt dump badging "${this.apkPath}"`, 
        { encoding: 'utf-8' });
      
      const lines = result.split('\n');
      const packageInfo = {};

      lines.forEach(line => {
        if (line.startsWith('package:')) {
          const nameMatch = line.match(/name='([^']+)'/);
          const versionCodeMatch = line.match(/versionCode='([^']+)'/);
          const versionNameMatch = line.match(/versionName='([^']+)'/);
          
          if (nameMatch) packageInfo.name = nameMatch[1];
          if (versionCodeMatch) packageInfo.versionCode = versionCodeMatch[1];
          if (versionNameMatch) packageInfo.versionName = versionNameMatch[1];
        }
        
        if (line.startsWith('application-label:')) {
          const labelMatch = line.match(/application-label:'([^']+)'/);
          if (labelMatch) packageInfo.label = labelMatch[1];
        }
      });

      return packageInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica la alineación del APK
   */
  checkZipAlign() {
    try {
      const result = execSync(`zipalign -c -v 4 "${this.apkPath}"`, 
        { encoding: 'utf-8' });
      return {
        aligned: !result.includes('FAILED'),
        details: result
      };
    } catch (error) {
      return {
        aligned: false,
        error: error.message
      };
    }
  }

  /**
   * Genera reporte de seguridad
   */
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      apkInfo: this.getApkInfo(),
      signature: this.verifySignature(),
      packageInfo: this.getPackageInfo(),
      zipAlign: this.checkZipAlign()
    };

    return report;
  }

  /**
   * Muestra el reporte en consola
   */
  displayReport(report) {
    console.log('🔍 Reporte de Verificación - Victus App');
    console.log('=====================================\n');

    // Información del APK
    console.log('📦 Información del APK:');
    console.log(`   📄 Archivo: ${report.apkInfo.path}`);
    console.log(`   📏 Tamaño: ${report.apkInfo.size}`);
    console.log(`   📅 Modificado: ${report.apkInfo.modified}\n`);

    // Información del paquete
    if (report.packageInfo) {
      console.log('📋 Información del Paquete:');
      console.log(`   🏷️  Nombre: ${report.packageInfo.name || 'N/A'}`);
      console.log(`   🏷️  Etiqueta: ${report.packageInfo.label || 'N/A'}`);
      console.log(`   🔢 Versión: ${report.packageInfo.versionName || 'N/A'} (${report.packageInfo.versionCode || 'N/A'})\n`);
    }

    // Verificación de firma
    console.log('🔐 Verificación de Firma:');
    if (report.signature.verified) {
      console.log('   ✅ APK firmado correctamente');
    } else {
      console.log('   ❌ APK NO firmado o firma inválida');
      if (report.signature.error) {
        console.log(`   🔴 Error: ${report.signature.error}`);
      }
    }

    // Alineación ZIP
    console.log('\n📐 Alineación ZIP:');
    if (report.zipAlign.aligned) {
      console.log('   ✅ APK alineado correctamente');
    } else {
      console.log('   ❌ APK NO alineado');
      if (report.zipAlign.error) {
        console.log(`   🔴 Error: ${report.zipAlign.error}`);
      }
    }

    // Recomendaciones
    console.log('\n💡 Recomendaciones:');
    
    if (!report.signature.verified) {
      console.log('   🔴 CRÍTICO: Firma el APK antes de publicar');
    }
    
    if (!report.zipAlign.aligned) {
      console.log('   🟡 ADVERTENCIA: Alinea el APK para optimizar rendimiento');
    }
    
    if (report.signature.verified && report.zipAlign.aligned) {
      console.log('   ✅ El APK está listo para publicación');
    }
  }

  /**
   * Guarda el reporte en archivo
   */
  saveReport(report) {
    const reportPath = `android/verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  }

  /**
   * Proceso principal
   */
  async run() {
    try {
      if (!this.apkPath) {
        console.error('❌ No se encontró ningún APK para verificar');
        console.log('💡 Uso: node scripts/verify-apk.js [ruta-del-apk]');
        process.exit(1);
      }

      // Verificar herramientas
      if (!this.checkJarsigner()) {
        process.exit(1);
      }

      // Generar y mostrar reporte
      const report = this.generateSecurityReport();
      this.displayReport(report);
      this.saveReport(report);

      // Código de salida basado en el resultado
      if (!report.signature.verified) {
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
  const verifier = new ApkVerifier();
  verifier.run();
}

module.exports = ApkVerifier;
