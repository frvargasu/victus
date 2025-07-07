#!/usr/bin/env node

/**
 * Script para verificar la configuración del entorno de desarrollo
 * Verifica JAVA_HOME, ANDROID_SDK_ROOT, y otras variables importantes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnvironmentChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: {},
      tools: {},
      paths: {},
      recommendations: []
    };
  }

  checkEnvironmentVariables() {
    console.log('🔍 Verificando variables de entorno...\n');
    
    const envVars = [
      'JAVA_HOME',
      'ANDROID_SDK_ROOT',
      'ANDROID_HOME',
      'PATH',
      'NODE_ENV',
      'CAPACITOR_PLATFORM',
      'IONIC_ENV'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      this.results.environment[varName] = {
        value: value || null,
        exists: !!value,
        length: value ? value.length : 0
      };
      
      if (value) {
        console.log(`✅ ${varName}: ${value}`);
      } else {
        console.log(`❌ ${varName}: No definida`);
      }
    });
  }

  checkJavaInstallation() {
    console.log('\n☕ Verificando Java...\n');
    
    try {
      const javaVersion = execSync('java -version', { encoding: 'utf8', stdio: 'pipe' });
      this.results.tools.java = {
        installed: true,
        version: javaVersion.toString().split('\n')[0],
        command: 'java -version'
      };
      console.log(`✅ Java instalado: ${this.results.tools.java.version}`);
    } catch (error) {
      this.results.tools.java = {
        installed: false,
        error: error.message
      };
      console.log('❌ Java no encontrado');
      this.results.recommendations.push('Instalar Java JDK 11 o superior');
    }

    // Verificar JAVA_HOME
    const javaHome = process.env.JAVA_HOME;
    if (javaHome) {
      const javaHomePath = path.join(javaHome, 'bin', 'java');
      this.results.paths.javaHome = {
        path: javaHome,
        exists: fs.existsSync(javaHomePath),
        executable: javaHomePath
      };
      
      if (fs.existsSync(javaHomePath)) {
        console.log(`✅ JAVA_HOME válido: ${javaHome}`);
      } else {
        console.log(`❌ JAVA_HOME inválido: ${javaHome}`);
        this.results.recommendations.push('Verificar que JAVA_HOME apunte a una instalación válida de Java');
      }
    }
  }

  checkAndroidSDK() {
    console.log('\n🤖 Verificando Android SDK...\n');
    
    const sdkRoot = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
    
    if (sdkRoot) {
      this.results.paths.androidSDK = {
        path: sdkRoot,
        exists: fs.existsSync(sdkRoot),
        tools: {}
      };
      
      // Verificar herramientas importantes
      const tools = [
        { name: 'adb', path: path.join(sdkRoot, 'platform-tools', 'adb') },
        { name: 'gradle', path: path.join(sdkRoot, 'tools', 'gradle') },
        { name: 'build-tools', path: path.join(sdkRoot, 'build-tools') }
      ];
      
      tools.forEach(tool => {
        const exists = fs.existsSync(tool.path) || fs.existsSync(tool.path + '.exe');
        this.results.paths.androidSDK.tools[tool.name] = {
          path: tool.path,
          exists: exists
        };
        
        if (exists) {
          console.log(`✅ ${tool.name}: ${tool.path}`);
        } else {
          console.log(`❌ ${tool.name}: No encontrado en ${tool.path}`);
        }
      });
      
      console.log(`✅ Android SDK Root: ${sdkRoot}`);
    } else {
      console.log('❌ ANDROID_SDK_ROOT/ANDROID_HOME no definido');
      this.results.recommendations.push('Definir ANDROID_SDK_ROOT con la ruta al Android SDK');
    }
  }

  checkIonicCapacitor() {
    console.log('\n⚡ Verificando Ionic y Capacitor...\n');
    
    try {
      const ionicVersion = execSync('ionic version', { encoding: 'utf8' });
      this.results.tools.ionic = {
        installed: true,
        version: ionicVersion.trim(),
        command: 'ionic version'
      };
      console.log(`✅ Ionic CLI: ${ionicVersion.trim()}`);
    } catch (error) {
      this.results.tools.ionic = {
        installed: false,
        error: error.message
      };
      console.log('❌ Ionic CLI no encontrado');
      this.results.recommendations.push('Instalar Ionic CLI: npm install -g @ionic/cli');
    }

    try {
      const capacitorVersion = execSync('npx cap --version', { encoding: 'utf8' });
      this.results.tools.capacitor = {
        installed: true,
        version: capacitorVersion.trim(),
        command: 'npx cap --version'
      };
      console.log(`✅ Capacitor: ${capacitorVersion.trim()}`);
    } catch (error) {
      this.results.tools.capacitor = {
        installed: false,
        error: error.message
      };
      console.log('❌ Capacitor no encontrado');
    }
  }

  checkProjectFiles() {
    console.log('\n📁 Verificando archivos del proyecto...\n');
    
    const projectFiles = [
      'package.json',
      'capacitor.config.ts',
      'ionic.config.json',
      'angular.json',
      'src/environments/environment.ts',
      'src/environments/environment.prod.ts',
      'src/environments/environment.staging.ts'
    ];
    
    this.results.paths.projectFiles = {};
    
    projectFiles.forEach(file => {
      const exists = fs.existsSync(file);
      this.results.paths.projectFiles[file] = {
        exists: exists,
        path: path.resolve(file)
      };
      
      if (exists) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file}`);
        if (file.includes('environment.staging.ts')) {
          this.results.recommendations.push('Crear archivo environment.staging.ts para entorno de staging');
        }
      }
    });
  }

  checkCapacitorPlatforms() {
    console.log('\n📱 Verificando plataformas Capacitor...\n');
    
    const platforms = ['android', 'ios'];
    this.results.paths.capacitorPlatforms = {};
    
    platforms.forEach(platform => {
      const platformPath = path.join(platform);
      const exists = fs.existsSync(platformPath);
      
      this.results.paths.capacitorPlatforms[platform] = {
        exists: exists,
        path: path.resolve(platformPath)
      };
      
      if (exists) {
        console.log(`✅ Plataforma ${platform}: ${platformPath}`);
        
        // Verificar archivos específicos
        if (platform === 'android') {
          const gradleFile = path.join(platformPath, 'app', 'build.gradle');
          const keystoreProps = path.join(platformPath, 'keystore.properties');
          
          console.log(`  ${fs.existsSync(gradleFile) ? '✅' : '❌'} build.gradle`);
          console.log(`  ${fs.existsSync(keystoreProps) ? '✅' : '❌'} keystore.properties`);
        }
      } else {
        console.log(`❌ Plataforma ${platform}: No encontrada`);
        this.results.recommendations.push(`Agregar plataforma ${platform}: npx cap add ${platform}`);
      }
    });
  }

  generateReport() {
    console.log('\n📊 Generando reporte...\n');
    
    // Calcular puntuación
    let score = 0;
    let totalChecks = 0;
    
    // Verificar herramientas
    Object.values(this.results.tools).forEach(tool => {
      totalChecks++;
      if (tool.installed) score++;
    });
    
    // Verificar variables de entorno críticas
    ['JAVA_HOME', 'ANDROID_SDK_ROOT'].forEach(envVar => {
      totalChecks++;
      if (this.results.environment[envVar]?.exists) score++;
    });
    
    // Verificar archivos del proyecto
    Object.values(this.results.paths.projectFiles || {}).forEach(file => {
      totalChecks++;
      if (file.exists) score++;
    });
    
    const percentage = Math.round((score / totalChecks) * 100);
    
    this.results.summary = {
      score: score,
      totalChecks: totalChecks,
      percentage: percentage,
      status: percentage >= 80 ? 'GOOD' : percentage >= 60 ? 'WARNING' : 'CRITICAL'
    };
    
    console.log(`📈 Puntuación del entorno: ${score}/${totalChecks} (${percentage}%)`);
    console.log(`🎯 Estado: ${this.results.summary.status}`);
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  saveReport() {
    const reportPath = 'environment-check-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Reporte guardado en: ${reportPath}`);
  }

  run() {
    console.log('🚀 Iniciando verificación del entorno de desarrollo Victus\n');
    console.log('=' + '='.repeat(60) + '\n');
    
    this.checkEnvironmentVariables();
    this.checkJavaInstallation();
    this.checkAndroidSDK();
    this.checkIonicCapacitor();
    this.checkProjectFiles();
    this.checkCapacitorPlatforms();
    this.generateReport();
    this.saveReport();
    
    console.log('\n' + '=' + '='.repeat(60));
    console.log('✨ Verificación completada');
    
    return this.results;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const checker = new EnvironmentChecker();
  checker.run();
}

module.exports = EnvironmentChecker;
