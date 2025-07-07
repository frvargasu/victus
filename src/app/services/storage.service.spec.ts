import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';
import { Producto } from '../models/producto';

/**
 * Pruebas unitarias para StorageService
 * Incluye mediciones de rendimiento y pruebas de funcionalidad
 */
describe('StorageService', () => {
  let service: StorageService;
  let storageSpy: jasmine.SpyObj<Storage>;

  // Datos de prueba
  const mockProductos: Producto[] = [
    {
      id: 1,
      nombre: 'Producto Test 1',
      precio: 19.99,
      descripcion: 'Descripción del producto 1',
      categoria: 'categoria1',
      imagen: 'imagen1.jpg'
    },
    {
      id: 2,
      nombre: 'Producto Test 2',
      precio: 29.99,
      descripcion: 'Descripción del producto 2',
      categoria: 'categoria2',
      imagen: 'imagen2.jpg'
    }
  ];

  beforeEach(() => {
    // Crear spy para Storage
    const storageMock = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'remove', 'clear', 'keys', 'length']);
    
    // Configurar respuestas por defecto
    storageMock.create.and.returnValue(Promise.resolve(storageMock));
    storageMock.set.and.returnValue(Promise.resolve());
    storageMock.get.and.returnValue(Promise.resolve(null));
    storageMock.remove.and.returnValue(Promise.resolve());
    storageMock.clear.and.returnValue(Promise.resolve());
    storageMock.keys.and.returnValue(Promise.resolve([]));
    storageMock.length.and.returnValue(Promise.resolve(0));

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: storageMock }
      ]
    });
    
    service = TestBed.inject(StorageService);
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  /**
   * Pruebas de creación del servicio
   */
  describe('Creación del servicio', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize storage on creation', async () => {
      console.time('🧪 Test: Inicialización del storage');
      
      await service.init();
      
      console.timeEnd('🧪 Test: Inicialización del storage');
      
      expect(storageSpy.create).toHaveBeenCalled();
    });
  });

  /**
   * Pruebas de métodos del carrito
   */
  describe('Métodos del carrito', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should save cart products', async () => {
      console.time('🧪 Test: Guardar carrito');
      
      await service.guardarCarrito(mockProductos);
      
      console.timeEnd('🧪 Test: Guardar carrito');
      
      expect(storageSpy.set).toHaveBeenCalledWith('carrito_productos', mockProductos);
    });

    it('should get cart products', async () => {
      console.time('🧪 Test: Obtener carrito');
      
      storageSpy.get.and.returnValue(Promise.resolve(mockProductos));
      
      const result = await service.obtenerCarrito();
      
      console.timeEnd('🧪 Test: Obtener carrito');
      
      expect(storageSpy.get).toHaveBeenCalledWith('carrito_productos');
      expect(result).toEqual(mockProductos);
    });

    it('should return empty array when no cart exists', async () => {
      console.time('🧪 Test: Carrito vacío');
      
      storageSpy.get.and.returnValue(Promise.resolve(null));
      
      const result = await service.obtenerCarrito();
      
      console.timeEnd('🧪 Test: Carrito vacío');
      
      expect(result).toEqual([]);
    });

    it('should clear cart', async () => {
      console.time('🧪 Test: Limpiar carrito');
      
      await service.limpiarCarrito();
      
      console.timeEnd('🧪 Test: Limpiar carrito');
      
      expect(storageSpy.remove).toHaveBeenCalledWith('carrito_productos');
    });
  });

  /**
   * Pruebas de métodos generales de storage
   */
  describe('Métodos generales de storage', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should set value', async () => {
      console.time('🧪 Test: Set value');
      
      const key = 'test_key';
      const value = 'test_value';
      
      await service.set(key, value);
      
      console.timeEnd('🧪 Test: Set value');
      
      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
    });

    it('should get value', async () => {
      console.time('🧪 Test: Get value');
      
      const key = 'test_key';
      const expectedValue = 'test_value';
      
      storageSpy.get.and.returnValue(Promise.resolve(expectedValue));
      
      const result = await service.get(key);
      
      console.timeEnd('🧪 Test: Get value');
      
      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should remove value', async () => {
      console.time('🧪 Test: Remove value');
      
      const key = 'test_key';
      
      await service.remove(key);
      
      console.timeEnd('🧪 Test: Remove value');
      
      expect(storageSpy.remove).toHaveBeenCalledWith(key);
    });

    it('should clear all storage', async () => {
      console.time('🧪 Test: Clear storage');
      
      await service.clear();
      
      console.timeEnd('🧪 Test: Clear storage');
      
      expect(storageSpy.clear).toHaveBeenCalled();
    });

    it('should get all keys', async () => {
      console.time('🧪 Test: Get keys');
      
      const mockKeys = ['key1', 'key2', 'key3'];
      storageSpy.keys.and.returnValue(Promise.resolve(mockKeys));
      
      const result = await service.keys();
      
      console.timeEnd('🧪 Test: Get keys');
      
      expect(storageSpy.keys).toHaveBeenCalled();
      expect(result).toEqual(mockKeys);
    });

    it('should get storage length', async () => {
      console.time('🧪 Test: Get length');
      
      const mockLength = 5;
      storageSpy.length.and.returnValue(Promise.resolve(mockLength));
      
      const result = await service.length();
      
      console.timeEnd('🧪 Test: Get length');
      
      expect(storageSpy.length).toHaveBeenCalled();
      expect(result).toBe(mockLength);
    });
  });

  /**
   * Pruebas de métodos de favoritos
   */
  describe('Métodos de favoritos', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should save favorites', async () => {
      console.time('🧪 Test: Guardar favoritos');
      
      await service.guardarFavoritos(mockProductos);
      
      console.timeEnd('🧪 Test: Guardar favoritos');
      
      expect(storageSpy.set).toHaveBeenCalledWith('productos_favoritos', mockProductos);
    });

    it('should get favorites', async () => {
      console.time('🧪 Test: Obtener favoritos');
      
      storageSpy.get.and.returnValue(Promise.resolve(mockProductos));
      
      const result = await service.obtenerFavoritos();
      
      console.timeEnd('🧪 Test: Obtener favoritos');
      
      expect(storageSpy.get).toHaveBeenCalledWith('productos_favoritos');
      expect(result).toEqual(mockProductos);
    });

    it('should return empty array when no favorites exist', async () => {
      console.time('🧪 Test: Sin favoritos');
      
      storageSpy.get.and.returnValue(Promise.resolve(null));
      
      const result = await service.obtenerFavoritos();
      
      console.timeEnd('🧪 Test: Sin favoritos');
      
      expect(result).toEqual([]);
    });

    it('should add product to favorites', async () => {
      console.time('🧪 Test: Agregar favorito');
      
      const existingFavorites = [mockProductos[0]];
      const newProduct = mockProductos[1];
      
      // Simular que obtenerFavoritos devuelve favoritos existentes
      storageSpy.get.and.returnValue(Promise.resolve(existingFavorites));
      
      await service.agregarFavorito(newProduct);
      
      console.timeEnd('🧪 Test: Agregar favorito');
      
      expect(storageSpy.get).toHaveBeenCalledWith('productos_favoritos');
      expect(storageSpy.set).toHaveBeenCalledWith('productos_favoritos', 
        jasmine.arrayContaining([
          jasmine.objectContaining({ nombre: newProduct.nombre, isFavorite: true })
        ])
      );
    });

    it('should not add duplicate product to favorites', async () => {
      console.time('🧪 Test: No duplicar favorito');
      
      const existingFavorites = [mockProductos[0]];
      const duplicateProduct = mockProductos[0];
      
      storageSpy.get.and.returnValue(Promise.resolve(existingFavorites));
      
      await service.agregarFavorito(duplicateProduct);
      
      console.timeEnd('🧪 Test: No duplicar favorito');
      
      // Verificar que no se llamó set porque el producto ya existe
      expect(storageSpy.set).not.toHaveBeenCalledWith('productos_favoritos', jasmine.any(Array));
    });

    it('should remove product from favorites', async () => {
      console.time('🧪 Test: Quitar favorito');
      
      const existingFavorites = [...mockProductos];
      const productToRemove = mockProductos[0].nombre;
      
      storageSpy.get.and.returnValue(Promise.resolve(existingFavorites));
      
      await service.quitarFavorito(productToRemove);
      
      console.timeEnd('🧪 Test: Quitar favorito');
      
      expect(storageSpy.get).toHaveBeenCalledWith('productos_favoritos');
      expect(storageSpy.set).toHaveBeenCalledWith('productos_favoritos', 
        jasmine.arrayContaining([
          jasmine.objectContaining({ nombre: mockProductos[1].nombre })
        ])
      );
    });

    it('should handle removing non-existent favorite', async () => {
      console.time('🧪 Test: Quitar favorito inexistente');
      
      const existingFavorites = [mockProductos[0]];
      const nonExistentProduct = 'Producto que no existe';
      
      storageSpy.get.and.returnValue(Promise.resolve(existingFavorites));
      
      await service.quitarFavorito(nonExistentProduct);
      
      console.timeEnd('🧪 Test: Quitar favorito inexistente');
      
      expect(storageSpy.set).toHaveBeenCalledWith('productos_favoritos', existingFavorites);
    });
  });

  /**
   * Pruebas de rendimiento
   */
  describe('Pruebas de rendimiento', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should perform storage operations within acceptable time', async () => {
      const startTime = performance.now();
      
      // Realizar múltiples operaciones
      await service.set('test1', 'value1');
      await service.set('test2', 'value2');
      await service.get('test1');
      await service.get('test2');
      await service.remove('test1');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`⏱️ Tiempo de operaciones múltiples: ${executionTime.toFixed(2)}ms`);
      
      // Verificar que tome menos de 100ms
      expect(executionTime).toBeLessThan(100);
    });

    it('should handle large arrays efficiently', async () => {
      console.time('🧪 Test: Array grande');
      
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        nombre: `Producto ${i}`,
        precio: i * 10,
        descripcion: `Descripción del producto ${i}`,
        categoria: `categoria${i % 10}`,
        imagen: `imagen${i}.jpg`
      }));
      
      const startTime = performance.now();
      
      await service.guardarCarrito(largeArray);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.timeEnd('🧪 Test: Array grande');
      console.log(`⏱️ Tiempo para guardar 1000 productos: ${executionTime.toFixed(2)}ms`);
      
      // Verificar que tome menos de 1 segundo
      expect(executionTime).toBeLessThan(1000);
    });
  });

  /**
   * Pruebas de casos edge
   */
  describe('Casos edge', () => {
    beforeEach(async () => {
      await service.init();
    });

    it('should handle undefined values', async () => {
      console.time('🧪 Test: Valores undefined');
      
      await service.set('undefined_key', undefined);
      
      console.timeEnd('🧪 Test: Valores undefined');
      
      expect(storageSpy.set).toHaveBeenCalledWith('undefined_key', undefined);
    });

    it('should handle null values', async () => {
      console.time('🧪 Test: Valores null');
      
      await service.set('null_key', null);
      
      console.timeEnd('🧪 Test: Valores null');
      
      expect(storageSpy.set).toHaveBeenCalledWith('null_key', null);
    });

    it('should handle empty strings', async () => {
      console.time('🧪 Test: Strings vacíos');
      
      await service.set('empty_key', '');
      
      console.timeEnd('🧪 Test: Strings vacíos');
      
      expect(storageSpy.set).toHaveBeenCalledWith('empty_key', '');
    });

    it('should handle complex objects', async () => {
      console.time('🧪 Test: Objetos complejos');
      
      const complexObject = {
        id: 1,
        data: {
          nested: {
            value: 'test',
            array: [1, 2, 3],
            date: new Date()
          }
        }
      };
      
      await service.set('complex_key', complexObject);
      
      console.timeEnd('🧪 Test: Objetos complejos');
      
      expect(storageSpy.set).toHaveBeenCalledWith('complex_key', complexObject);
    });
  });
});
