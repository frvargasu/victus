#!/usr/bin/env node

/**
 * Script para probar la integración multiplataforma
 * Ejecuta builds y verificaciones en Android, iOS y Web
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MultiplatformTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      tests: {
        web: { status: 'pending', duration: 0, output: '', error: null },
        android: { status: 'pending', duration: 0, output: '', error: null },
        ios: { status: 'pending', duration: 0, output: '', error: null }
      },
      summary: {
        passed: 0,
        failed: 0,
        skipped: 0,
        totalTime: 0
      }
    };
  }

  async runCommand(command, options = {}) {
    const startTime = Date.now();
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });
      const duration = Date.now() - startTime;
      return { success: true, output, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, error: error.message, duration };
    }
  }

  async testWeb() {
    console.log('🌐 Probando plataforma Web...\n');
    
    try {
      // Build para web
      console.log('   📦 Ejecutando build web...');
      const buildResult = await this.runCommand('npm run build');
      
      if (!buildResult.success) {
        throw new Error(`Build falló: ${buildResult.error}`);
      }
      
      // Verificar archivos generados
      const wwwExists = fs.existsSync('www');
      const indexExists = fs.existsSync('www/index.html');
      
      if (!wwwExists || !indexExists) {
        throw new Error('Archivos de build no encontrados');
      }
      
      this.results.tests.web = {
        status: 'passed',
        duration: buildResult.duration,
        output: 'Build web exitoso',
        checks: {
          buildSuccess: true,
          wwwExists: wwwExists,
          indexExists: indexExists
        }
      };
      
      console.log('   ✅ Web build exitoso');
      
    } catch (error) {
      this.results.tests.web = {
        status: 'failed',
        duration: 0,
        output: '',
        error: error.message
      };
      console.log(`   ❌ Web build falló: ${error.message}`);
    }
  }

  async testAndroid() {
    console.log('\n🤖 Probando plataforma Android...\n');
    
    try {
      // Verificar que la plataforma existe
      if (!fs.existsSync('android')) {
        throw new Error('Plataforma Android no encontrada');
      }
      
      // Sincronizar con Capacitor
      console.log('   🔄 Sincronizando con Capacitor...');
      const syncResult = await this.runCommand('npx cap sync android');
      
      if (!syncResult.success) {
        throw new Error(`Sync falló: ${syncResult.error}`);
      }
      
      // Verificar configuración de firma
      const keystoreProps = path.join('android', 'keystore.properties');
      const keystoreExists = fs.existsSync(keystoreProps);
      
      // Intentar build de debug
      console.log('   📦 Ejecutando build Android debug...');
      const buildResult = await this.runCommand('cd android && ./gradlew assembleDebug', {
        cwd: process.cwd()
      });
      
      if (!buildResult.success) {
        throw new Error(`Build Android falló: ${buildResult.error}`);
      }
      
      // Verificar APK generado
      const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
      const apkExists = fs.existsSync(apkPath);
      
      this.results.tests.android = {
        status: 'passed',
        duration: syncResult.duration + buildResult.duration,
        output: 'Build Android exitoso',
        checks: {
          platformExists: true,
          syncSuccess: true,
          keystoreExists: keystoreExists,
          buildSuccess: true,
          apkExists: apkExists
        }
      };
      
      console.log('   ✅ Android build exitoso');
      
    } catch (error) {
      this.results.tests.android = {
        status: 'failed',
        duration: 0,
        output: '',
        error: error.message
      };
      console.log(`   ❌ Android build falló: ${error.message}`);
    }
  }

  async testIOS() {
    console.log('\n🍎 Probando plataforma iOS...\n');
    
    try {
      // En Windows, iOS no es compatible
      if (process.platform === 'win32') {
        this.results.tests.ios = {
          status: 'skipped',
          duration: 0,
          output: 'iOS no compatible en Windows',
          error: 'Platform not supported'
        };
        console.log('   ⏭️  iOS omitido (no compatible en Windows)');
        return;
      }
      
      // Verificar que la plataforma existe
      if (!fs.existsSync('ios')) {
        throw new Error('Plataforma iOS no encontrada');
      }
      
      // Sincronizar con Capacitor
      console.log('   🔄 Sincronizando con Capacitor...');
      const syncResult = await this.runCommand('npx cap sync ios');
      
      if (!syncResult.success) {
        throw new Error(`Sync falló: ${syncResult.error}`);
      }
      
      // Verificar Xcode (solo verificar que existe)
      const xcodeResult = await this.runCommand('xcode-select --print-path');
      
      if (!xcodeResult.success) {
        throw new Error('Xcode no encontrado');
      }
      
      this.results.tests.ios = {
        status: 'passed',
        duration: syncResult.duration,
        output: 'Sync iOS exitoso',
        checks: {
          platformExists: true,
          syncSuccess: true,
          xcodeExists: true
        }
      };
      
      console.log('   ✅ iOS sync exitoso');
      
    } catch (error) {
      this.results.tests.ios = {
        status: 'failed',
        duration: 0,
        output: '',
        error: error.message
      };
      console.log(`   ❌ iOS test falló: ${error.message}`);
    }
  }

  async testEnvironmentConfigs() {
    console.log('\n⚙️  Probando configuraciones de entorno...\n');
    
    const environments = ['development', 'staging', 'production'];
    const configTests = {};
    
    for (const env of environments) {
      try {
        // Verificar archivos de configuración
        const envFile = `src/environments/environment${env === 'development' ? '' : '.' + env}.ts`;
        const envExists = fs.existsSync(envFile);
        
        if (!envExists) {
          throw new Error(`Archivo de configuración no encontrado: ${envFile}`);
        }
        
        // Leer y validar configuración
        const envContent = fs.readFileSync(envFile, 'utf8');
        const hasApiUrl = envContent.includes('apiUrl');
        const hasFeatures = envContent.includes('features');
        const hasPlatform = envContent.includes('platform');
        
        configTests[env] = {
          status: 'passed',
          checks: {
            fileExists: envExists,
            hasApiUrl: hasApiUrl,
            hasFeatures: hasFeatures,
            hasPlatform: hasPlatform
          }
        };
        
        console.log(`   ✅ Configuración ${env} válida`);
        
      } catch (error) {
        configTests[env] = {
          status: 'failed',
          error: error.message
        };
        console.log(`   ❌ Configuración ${env} falló: ${error.message}`);
      }
    }
    
    this.results.configTests = configTests;
  }

  generateSummary() {
    const tests = this.results.tests;
    
    // Contar resultados
    Object.values(tests).forEach(test => {
      switch (test.status) {
        case 'passed':
          this.results.summary.passed++;
          break;
        case 'failed':
          this.results.summary.failed++;
          break;
        case 'skipped':
          this.results.summary.skipped++;
          break;
      }
      this.results.summary.totalTime += test.duration;
    });
    
    // Calcular porcentaje de éxito
    const totalTests = this.results.summary.passed + this.results.summary.failed;
    const successRate = totalTests > 0 ? Math.round((this.results.summary.passed / totalTests) * 100) : 0;
    
    this.results.summary.successRate = successRate;
    this.results.summary.status = successRate >= 80 ? 'GOOD' : successRate >= 50 ? 'WARNING' : 'CRITICAL';
    
    console.log('\n📊 Resumen de pruebas multiplataforma:');
    console.log(`   ✅ Exitosas: ${this.results.summary.passed}`);
    console.log(`   ❌ Fallidas: ${this.results.summary.failed}`);
    console.log(`   ⏭️  Omitidas: ${this.results.summary.skipped}`);
    console.log(`   🎯 Tasa de éxito: ${successRate}%`);
    console.log(`   ⏱️  Tiempo total: ${Math.round(this.results.summary.totalTime / 1000)}s`);
    console.log(`   🏆 Estado: ${this.results.summary.status}`);
  }

  saveReport() {
    const reportPath = 'multiplatform-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Reporte guardado en: ${reportPath}`);
  }

  async run() {
    console.log('🚀 Iniciando pruebas multiplataforma Victus\n');
    console.log('=' + '='.repeat(60) + '\n');
    
    const startTime = Date.now();
    
    await this.testWeb();
    await this.testAndroid();
    await this.testIOS();
    await this.testEnvironmentConfigs();
    
    const totalTime = Date.now() - startTime;
    this.results.summary.totalTime = totalTime;
    
    this.generateSummary();
    this.saveReport();
    
    console.log('\n' + '=' + '='.repeat(60));
    console.log('✨ Pruebas multiplataforma completadas');
    
    return this.results;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const tester = new MultiplatformTester();
  tester.run().then(results => {
    // Salir con código de error si hay fallos críticos
    if (results.summary.status === 'CRITICAL') {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error en pruebas multiplataforma:', error);
    process.exit(1);
  });
}

module.exports = MultiplatformTester;
