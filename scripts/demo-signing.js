#!/usr/bin/env node

/**
 * 🎯 Demo de Scripts de Firma - Victus App
 * 
 * Este script demuestra el uso de todos los scripts de firma
 * Uso: node scripts/demo-signing.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

class SigningDemo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async askUser(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  showHeader() {
    console.log('🎯 Demo de Firma de APK/AAB - Victus App');
    console.log('======================================\n');
    console.log('Este demo te guiará por todo el proceso de firma:\n');
    console.log('1. ✅ Verificación de prerequisitos');
    console.log('2. 🔐 Generación de keystore');
    console.log('3. 📦 Build y firma de APK/AAB');
    console.log('4. 🔍 Verificación de archivos');
    console.log('5. 📋 Resumen y siguiente pasos\n');
  }

  checkPrerequisites() {
    console.log('1. ✅ Verificando prerequisitos...\n');
    
    const tools = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'Java JDK', command: 'java -version' },
      { name: 'keytool', command: 'keytool -help' },
      { name: 'Ionic CLI', command: 'ionic --version' },
      { name: 'Android SDK', command: 'android --version' }
    ];

    let allGood = true;
    
    tools.forEach(tool => {
      try {
        execSync(tool.command, { stdio: 'ignore' });
        console.log(`   ✅ ${tool.name} disponible`);
      } catch (error) {
        console.log(`   ❌ ${tool.name} no disponible`);
        allGood = false;
      }
    });

    if (!allGood) {
      console.log('\n⚠️ Algunos prerequisitos faltan. Instálalos antes de continuar.\n');
      return false;
    }

    console.log('\n✅ Todos los prerequisitos están disponibles\n');
    return true;
  }

  async demoKeystoreGeneration() {
    console.log('2. 🔐 Generación de keystore...\n');

    const keystoreExists = fs.existsSync('android/keystores/victus-release-key.keystore');
    
    if (keystoreExists) {
      console.log('   ℹ️ Ya existe un keystore de producción');
      const regenerate = await this.askUser('   ¿Regenerar keystore? (y/N): ');
      
      if (regenerate.toLowerCase() !== 'y') {
        console.log('   ⏭️ Usando keystore existente\n');
        return true;
      }
    }

    console.log('   🎯 Ejecutando: npm run keystore:generate\n');
    console.log('   📝 Nota: Este es un proceso interactivo que solicitará:');
    console.log('      - Contraseña del keystore');
    console.log('      - Contraseña de la clave');
    console.log('      - Información del desarrollador\n');

    const proceed = await this.askUser('   ¿Continuar con la generación? (y/N): ');
    
    if (proceed.toLowerCase() !== 'y') {
      console.log('   ⏭️ Saltando generación de keystore\n');
      return false;
    }

    try {
      execSync('npm run keystore:generate', { stdio: 'inherit' });
      console.log('\n✅ Keystore generado exitosamente\n');
      return true;
    } catch (error) {
      console.log('\n❌ Error generando keystore\n');
      return false;
    }
  }

  async demoBuildAndSign() {
    console.log('3. 📦 Build y firma de APK/AAB...\n');

    const options = [
      { name: 'Debug APK', command: 'npm run apk:debug', desc: 'Rápido, para pruebas' },
      { name: 'Release APK', command: 'npm run apk:release', desc: 'Producción, firmado' },
      { name: 'Debug AAB', command: 'npm run aab:debug', desc: 'App Bundle para pruebas' },
      { name: 'Release AAB', command: 'npm run aab:release', desc: 'App Bundle para Play Store' },
      { name: 'Saltar build', command: null, desc: 'Continuar sin build' }
    ];

    console.log('   📋 Opciones de build:');
    options.forEach((option, index) => {
      console.log(`      ${index + 1}. ${option.name} - ${option.desc}`);
    });

    const choice = await this.askUser('\n   Selecciona una opción (1-5): ');
    const selectedOption = options[parseInt(choice) - 1];

    if (!selectedOption || !selectedOption.command) {
      console.log('   ⏭️ Saltando build\n');
      return false;
    }

    console.log(`\n   🎯 Ejecutando: ${selectedOption.command}\n`);
    console.log('   📝 Nota: Este proceso puede tardar varios minutos...\n');

    try {
      execSync(selectedOption.command, { stdio: 'inherit' });
      console.log('\n✅ Build completado exitosamente\n');
      return true;
    } catch (error) {
      console.log('\n❌ Error durante el build\n');
      return false;
    }
  }

  async demoVerification() {
    console.log('4. 🔍 Verificación de archivos...\n');

    const options = [
      { name: 'Verificar APK', command: 'npm run apk:verify', desc: 'Verificar archivo APK' },
      { name: 'Verificar AAB', command: 'npm run aab:verify', desc: 'Verificar App Bundle' },
      { name: 'Saltar verificación', command: null, desc: 'Continuar sin verificar' }
    ];

    console.log('   📋 Opciones de verificación:');
    options.forEach((option, index) => {
      console.log(`      ${index + 1}. ${option.name} - ${option.desc}`);
    });

    const choice = await this.askUser('\n   Selecciona una opción (1-3): ');
    const selectedOption = options[parseInt(choice) - 1];

    if (!selectedOption || !selectedOption.command) {
      console.log('   ⏭️ Saltando verificación\n');
      return false;
    }

    console.log(`\n   🎯 Ejecutando: ${selectedOption.command}\n`);

    try {
      execSync(selectedOption.command, { stdio: 'inherit' });
      console.log('\n✅ Verificación completada\n');
      return true;
    } catch (error) {
      console.log('\n❌ Error durante la verificación\n');
      return false;
    }
  }

  showSummary() {
    console.log('5. 📋 Resumen y siguiente pasos\n');
    console.log('   🎉 Demo completado exitosamente\n');
    console.log('   📚 Comandos disponibles:');
    console.log('      npm run keystore:generate  - Generar keystore');
    console.log('      npm run apk:debug          - Build APK debug');
    console.log('      npm run apk:release        - Build APK release');
    console.log('      npm run aab:debug          - Build AAB debug');
    console.log('      npm run aab:release        - Build AAB release');
    console.log('      npm run apk:verify         - Verificar APK');
    console.log('      npm run aab:verify         - Verificar AAB');
    console.log('      npm run build:clean        - Limpiar builds\n');
    console.log('   📖 Documentación completa en SIGNING_GUIDE.md\n');
    console.log('   🚀 Para publicar en Google Play Store:');
    console.log('      1. Usar npm run aab:release (preferido)');
    console.log('      2. O usar npm run apk:release');
    console.log('      3. Subir archivo desde dist/ o android/app/build/outputs/');
    console.log('      4. Los archivos .aab reducen el tamaño de descarga hasta 15%\n');
    console.log('   💡 Diferencias APK vs AAB:');
    console.log('      📦 APK: Archivo tradicional, funciona en todos lados');
    console.log('      📱 AAB: Formato moderno, optimizado para Play Store');
    console.log('      🔧 AAB: Google genera APK específicos por dispositivo');
  }

  async run() {
    this.showHeader();

    try {
      // Verificar prerequisitos
      const prereqsOk = this.checkPrerequisites();
      if (!prereqsOk) {
        console.log('❌ Resuelve los prerequisitos antes de continuar');
        return;
      }

      // Demo de generación de keystore
      await this.demoKeystoreGeneration();

      // Demo de build y firma
      await this.demoBuildAndSign();

      // Demo de verificación
      await this.demoVerification();

      // Mostrar resumen
      this.showSummary();

    } catch (error) {
      console.error('❌ Error durante el demo:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const demo = new SigningDemo();
  demo.run();
}

module.exports = SigningDemo;
