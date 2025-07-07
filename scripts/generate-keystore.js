#!/usr/bin/env node

/**
 * 🔐 Script para generar keystore automáticamente
 * Proyecto: Victus App
 * 
 * Uso: node scripts/generate-keystore.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración por defecto
const DEFAULT_CONFIG = {
  keystorePath: 'android/keystores/victus-release-key.keystore',
  alias: 'victus-key',
  keyAlg: 'RSA',
  keySize: 2048,
  validity: 25 * 365, // 25 años
  dname: 'CN=Victus App, OU=Development, O=Victus, L=Ciudad, ST=Estado, C=ES'
};

class KeystoreGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Solicita entrada del usuario
   */
  async askUser(question, defaultValue = '') {
    return new Promise((resolve) => {
      const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  /**
   * Verifica si keytool está disponible
   */
  checkKeytool() {
    try {
      execSync('keytool -help', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('❌ keytool no está disponible. Instala Java JDK.');
      return false;
    }
  }

  /**
   * Crea directorio si no existe
   */
  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Directorio creado: ${dirPath}`);
    }
  }

  /**
   * Genera el keystore
   */
  async generateKeystore(config) {
    const { keystorePath, alias, keyAlg, keySize, validity, dname, storepass, keypass } = config;
    
    // Crear directorio para keystore
    this.ensureDirectory(path.dirname(keystorePath));

    // Verificar si ya existe
    if (fs.existsSync(keystorePath)) {
      const overwrite = await this.askUser('⚠️ El keystore ya existe. ¿Sobrescribir? (y/N)', 'N');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Operación cancelada');
        return false;
      }
    }

    // Comando keytool
    const command = `keytool -genkey -v -keystore ${keystorePath} -alias ${alias} ` +
      `-keyalg ${keyAlg} -keysize ${keySize} -validity ${validity} ` +
      `-storepass ${storepass} -keypass ${keypass} -dname "${dname}"`;

    try {
      console.log('🔐 Generando keystore...');
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Keystore generado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al generar keystore:', error.message);
      return false;
    }
  }

  /**
   * Crea archivo keystore.properties
   */
  createKeystoreProperties(config) {
    const { keystorePath, alias, storepass, keypass } = config;
    
    const content = `# Configuración del Keystore para Victus App
# ⚠️ NUNCA subir este archivo a control de versiones
# Agregar keystore.properties al .gitignore

storeFile=${keystorePath}
storePassword=${storepass}
keyAlias=${alias}
keyPassword=${keypass}
`;

    const propertiesPath = 'android/keystore.properties';
    fs.writeFileSync(propertiesPath, content);
    console.log(`📄 Archivo creado: ${propertiesPath}`);
  }

  /**
   * Actualiza .gitignore
   */
  updateGitignore() {
    const gitignorePath = '.gitignore';
    const entries = [
      '# Keystore files',
      'android/keystore.properties',
      'android/keystores/*.keystore',
      'android/keystores/*.jks',
      ''
    ];

    let content = '';
    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, 'utf-8');
    }

    let needsUpdate = false;
    entries.forEach(entry => {
      if (entry && !content.includes(entry)) {
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      content += '\n' + entries.join('\n');
      fs.writeFileSync(gitignorePath, content);
      console.log('📝 .gitignore actualizado');
    }
  }

  /**
   * Proceso principal
   */
  async run() {
    console.log('🔐 Generador de Keystore - Victus App');
    console.log('=====================================\n');

    // Verificar keytool
    if (!this.checkKeytool()) {
      process.exit(1);
    }

    try {
      // Solicitar configuración
      const config = { ...DEFAULT_CONFIG };
      
      console.log('📋 Configuración del keystore:\n');
      config.keystorePath = await this.askUser('Ruta del keystore', config.keystorePath);
      config.alias = await this.askUser('Alias de la clave', config.alias);
      config.dname = await this.askUser('Nombre distinguido (DN)', config.dname);
      
      // Contraseñas
      config.storepass = await this.askUser('Contraseña del keystore (mínimo 6 caracteres)');
      if (config.storepass.length < 6) {
        console.error('❌ La contraseña debe tener al menos 6 caracteres');
        process.exit(1);
      }
      
      config.keypass = await this.askUser('Contraseña de la clave', config.storepass);

      // Generar keystore
      const success = await this.generateKeystore(config);
      if (!success) {
        process.exit(1);
      }

      // Crear archivos adicionales
      this.createKeystoreProperties(config);
      this.updateGitignore();

      console.log('\n✅ Configuración completada');
      console.log('🔄 Siguiente paso: npm run android:release');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new KeystoreGenerator();
  generator.run();
}

module.exports = KeystoreGenerator;
