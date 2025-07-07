# 🧪 Configuración de Pruebas - Victus App

## 📋 Actividad 1: Configuración de Pruebas

### 🎯 Objetivo
Implementar un sistema completo de pruebas unitarias y E2E para el proyecto Ionic, simulando uso real con mediciones de rendimiento.

### 📂 Estructura Implementada

```
victus/
├── src/
│   ├── app/
│   │   ├── productos/
│   │   │   └── productos.page.spec.ts          # Pruebas unitarias
│   │   └── services/
│   │       └── storage.service.spec.ts         # Pruebas de servicio
├── e2e/
│   ├── src/
│   │   ├── productos.po.ts                     # Page Object Model
│   │   └── productos.e2e-spec.ts               # Pruebas E2E
│   └── tsconfig.json                           # Configuración TypeScript
├── karma.conf.js                               # Configuración Karma
├── protractor.conf.js                          # Configuración Protractor
└── package.json                                # Scripts y dependencias
```

### 🔧 Herramientas Configuradas

#### 1. **Karma** + **Jasmine** (Pruebas Unitarias)
- **Propósito**: Ejecutar pruebas unitarias en navegadores
- **Configuración**: `karma.conf.js`
- **Cobertura**: Habilitada con reportes HTML

#### 2. **Protractor** (Pruebas E2E)
- **Propósito**: Simular interacciones de usuario reales
- **Configuración**: `protractor.conf.js`
- **Modo**: Headless para CI/CD

#### 3. **Page Object Model**
- **Archivo**: `productos.po.ts`
- **Propósito**: Encapsular elementos y acciones de la página
- **Beneficios**: Mantenimiento fácil y reutilización

### 📊 Tipos de Pruebas Implementadas

#### 🧪 Pruebas Unitarias (`productos.page.spec.ts`)
- ✅ **Creación del componente**
- ✅ **Inicialización de datos** (con medición de rendimiento)
- ✅ **Búsqueda de productos**
- ✅ **Filtrado por categoría**
- ✅ **Gestión de favoritos**
- ✅ **Gestión del carrito**
- ✅ **Navegación**
- ✅ **Métodos auxiliares**
- ✅ **Pruebas de rendimiento**

#### 🧪 Pruebas de Servicio (`storage.service.spec.ts`)
- ✅ **Inicialización del servicio**
- ✅ **Operaciones del carrito**
- ✅ **Métodos generales de storage**
- ✅ **Gestión de favoritos**
- ✅ **Pruebas de rendimiento**
- ✅ **Casos edge**

#### 🌐 Pruebas E2E (`productos.e2e-spec.ts`)
- ✅ **Carga inicial de datos**
- ✅ **Funcionalidad de búsqueda**
- ✅ **Filtrado por categoría**
- ✅ **Funcionalidad del carrito**
- ✅ **Gestión de favoritos**
- ✅ **Actualización de datos**
- ✅ **Limpieza de filtros**

### 🚀 Scripts de Ejecución

```bash
# Pruebas unitarias
npm run test                    # Ejecutar una vez
npm run test:watch              # Modo watch
npm run test:coverage           # Con cobertura
npm run test:ci                 # Para CI/CD

# Pruebas E2E
npm run e2e                     # Ejecutar E2E
npm run e2e:dev                 # Modo desarrollo
```

### 📈 Mediciones de Rendimiento

#### ⏱️ Benchmarks Implementados
- **Inicialización**: < 1000ms
- **Búsqueda**: < 500ms
- **Operaciones Storage**: < 100ms
- **Operaciones múltiples**: < 100ms
- **Arrays grandes (1000 elementos)**: < 1000ms

#### 📊 Ejemplos de Logs
```typescript
console.time('🧪 Test: Inicialización de datos');
// ... código de prueba ...
console.timeEnd('🧪 Test: Inicialización de datos');
console.log('⏱️ Tiempo de inicialización: 234.56ms');
```

### 🔍 Características Implementadas

#### 1. **Simulación de Uso Real**
- Mock de servicios realistas
- Datos de prueba representativos
- Escenarios de error y éxito

#### 2. **Mediciones de Rendimiento**
- `console.time()` y `console.timeEnd()`
- Verificación de tiempos límite
- Logs informativos con emojis

#### 3. **Cobertura Completa**
- Métodos públicos y privados
- Casos de éxito y error
- Casos edge y valores límite

#### 4. **Page Object Model**
- Encapsulación de elementos DOM
- Métodos reutilizables
- Mantenimiento simplificado

### 🛠️ Configuración Detallada

#### Karma Configuration
```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
  });
};
```

#### Protractor Configuration
```javascript
// protractor.conf.js
exports.config = {
  allScriptsTimeout: 11000,
  specs: ['./e2e/src/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--no-sandbox']
    }
  },
};
```

### 📝 Documentación de Pruebas

#### Describe() y it() Descriptivos
```typescript
describe('Búsqueda de productos', () => {
  it('should search products successfully', async () => {
    // Arrange
    const event = { target: { value: 'camiseta' } };
    
    // Act
    await component.buscarProductos(event);
    
    // Assert
    expect(apiServiceSpy.buscarProductos).toHaveBeenCalledWith('camiseta');
  });
});
```

#### Comentarios Técnicos
- **Arrange**: Configuración de datos y mocks
- **Act**: Ejecución del código a probar
- **Assert**: Verificación de resultados

### 🔄 Flujo de Pruebas

#### 1. **Configuración (beforeEach)**
- Creación de spies y mocks
- Configuración de TestBed
- Inicialización de componentes

#### 2. **Ejecución**
- Medición de tiempo de inicio
- Ejecución del código
- Medición de tiempo final

#### 3. **Verificación**
- Validación de resultados
- Verificación de llamadas a servicios
- Comprobación de tiempos de ejecución

### 📊 Reportes de Cobertura

#### Configuración de Cobertura
```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage/app'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' }
  ]
}
```

#### Métricas Objetivo
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### 🎯 Beneficios Implementados

#### 1. **Calidad del Código**
- Detección temprana de bugs
- Refactoring seguro
- Documentación viva

#### 2. **Confianza en Deployments**
- Pruebas automáticas
- Verificación de regresiones
- Validación de performance

#### 3. **Mantenibilidad**
- Código bien estructurado
- Fácil identificación de problemas
- Evolución controlada

### 🚀 Siguientes Pasos

1. **Ejecutar pruebas**: `npm run test`
2. **Revisar cobertura**: Abrir `coverage/index.html`
3. **Ejecutar E2E**: `npm run e2e`
4. **Optimizar tiempos**: Basándose en métricas de rendimiento
5. **Expandir cobertura**: Agregar más componentes y servicios

### 📋 Checklist de Implementación

- ✅ Configuración de Karma
- ✅ Configuración de Protractor
- ✅ Pruebas unitarias de ProductosPage
- ✅ Pruebas de StorageService
- ✅ Pruebas E2E con Page Object Model
- ✅ Mediciones de rendimiento
- ✅ Scripts de ejecución
- ✅ Documentación técnica
- ✅ Casos de error y edge cases

---


