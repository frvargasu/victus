import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ProductosPage } from './productos.page';
import { ApiService } from '../services/api.service';
import { CarritoService } from '../services/carrito.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/**
 * Pruebas unitarias para ProductosPage
 * Implementa mediciones de rendimiento y simulación de uso real
 */
describe('ProductosPage', () => {
  let component: ProductosPage;
  let fixture: ComponentFixture<ProductosPage>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let carritoServiceSpy: jasmine.SpyObj<CarritoService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;

  // Datos de prueba simulados
  const mockProductos = [
    {
      id: 1,
      nombre: 'Camiseta Test',
      precio: 25.99,
      descripcion: 'Camiseta de prueba',
      imagen: 'test-image.jpg',
      categoria: 'ropa',
      isFavorite: false
    },
    {
      id: 2,
      nombre: 'Pantalón Test',
      precio: 45.99,
      descripcion: 'Pantalón de prueba',
      imagen: 'test-image2.jpg',
      categoria: 'ropa',
      isFavorite: true
    },
    {
      id: 3,
      nombre: 'Zapatos Test',
      precio: 89.99,
      descripcion: 'Zapatos de prueba',
      imagen: 'test-image3.jpg',
      categoria: 'calzado',
      isFavorite: false
    }
  ];

  const mockCategorias = ['ropa', 'calzado', 'accesorios'];

  beforeEach(async () => {
    // Crear spies para todos los servicios
    const apiSpy = jasmine.createSpyObj('ApiService', ['obtenerProductos', 'obtenerCategorias', 'buscarProductos', 'obtenerProductosPorCategoria']);
    const carritoSpy = jasmine.createSpyObj('CarritoService', ['agregarAlCarrito']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['obtenerFavoritos', 'agregarFavorito', 'quitarFavorito']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['mostrarToastError', 'mostrarToastExito', 'mostrarToastFavorito']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);

    // Configurar respuestas por defecto
    apiSpy.obtenerProductos.and.returnValue(Promise.resolve(mockProductos));
    apiSpy.obtenerCategorias.and.returnValue(Promise.resolve(mockCategorias));
    apiSpy.buscarProductos.and.returnValue(Promise.resolve(mockProductos.slice(0, 1)));
    apiSpy.obtenerProductosPorCategoria.and.returnValue(Promise.resolve(mockProductos.slice(0, 2)));
    
    carritoSpy.agregarAlCarrito.and.returnValue(Promise.resolve());
    
    storageSpy.obtenerFavoritos.and.returnValue(Promise.resolve([mockProductos[1]]));
    storageSpy.agregarFavorito.and.returnValue(Promise.resolve());
    storageSpy.quitarFavorito.and.returnValue(Promise.resolve());
    
    toastSpy.mostrarToastError.and.returnValue(Promise.resolve());
    toastSpy.mostrarToastExito.and.returnValue(Promise.resolve());
    toastSpy.mostrarToastFavorito.and.returnValue(Promise.resolve());

    // Mock para LoadingController
    const loadingElement = {
      present: jasmine.createSpy().and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    loadingSpy.create.and.returnValue(Promise.resolve(loadingElement));

    // Mock para AlertController
    const alertElement = {
      present: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    alertSpy.create.and.returnValue(Promise.resolve(alertElement));

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [IonicModule.forRoot(), ProductosPage],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: CarritoService, useValue: carritoSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosPage);
    component = fixture.componentInstance;
    
    // Asignar los spies
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    carritoServiceSpy = TestBed.inject(CarritoService) as jasmine.SpyObj<CarritoService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    loadingControllerSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
  });

  /**
   * Pruebas de creación del componente
   */
  describe('Creación del componente', () => {
    it('should create', () => {
      expect(!!component).toBeTrue();
    });

    it('should initialize with empty arrays', () => {
      expect(component.productos).toEqual([]);
      expect(component.productosFiltrados).toEqual([]);
      expect(component.categorias).toEqual([]);
      expect(component.categoriaSeleccionada).toEqual('');
      expect(component.terminoBusqueda).toEqual('');
      expect(component.cargando).toEqual(false);
    });
  });

  /**
   * Pruebas de inicialización con medición de rendimiento
   */
  describe('Inicialización de datos', () => {
    it('should initialize data successfully', async () => {
      console.time('🧪 Test: Inicialización de datos');
      
      await component.ngOnInit();
      
      console.timeEnd('🧪 Test: Inicialización de datos');
      
      expect(apiServiceSpy.obtenerProductos).toHaveBeenCalled();
      expect(apiServiceSpy.obtenerCategorias).toHaveBeenCalled();
      expect(component.productos).toEqual(mockProductos);
      expect(component.productosFiltrados).toEqual(mockProductos);
      expect(component.categorias).toEqual(mockCategorias);
    });

    it('should handle initialization errors', async () => {
      console.time('🧪 Test: Error en inicialización');
      
      apiServiceSpy.obtenerProductos.and.returnValue(Promise.reject('Error de red'));
      
      await component.ngOnInit();
      
      console.timeEnd('🧪 Test: Error en inicialización');
      
      expect(toastServiceSpy.mostrarToastError).toHaveBeenCalledWith('Error al cargar datos iniciales');
    });

    it('should show alert when no products are loaded', async () => {
      console.time('🧪 Test: Sin productos');
      
      apiServiceSpy.obtenerProductos.and.returnValue(Promise.resolve([]));
      
      await component.ngOnInit();
      
      console.timeEnd('🧪 Test: Sin productos');
      
      expect(alertControllerSpy.create).toHaveBeenCalled();
    });
  });

  /**
   * Pruebas de búsqueda con medición de rendimiento
   */
  describe('Búsqueda de productos', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('should search products successfully', async () => {
      console.time('🧪 Test: Búsqueda exitosa');
      
      const event = { target: { value: 'camiseta' } };
      
      await component.buscarProductos(event);
      
      console.timeEnd('🧪 Test: Búsqueda exitosa');
      
      expect(apiServiceSpy.buscarProductos).toHaveBeenCalledWith('camiseta');
      expect(component.terminoBusqueda).toEqual('camiseta');
      expect(component.productosFiltrados).toEqual(mockProductos.slice(0, 1));
    });

    it('should restore full list when search is empty', async () => {
      console.time('🧪 Test: Búsqueda vacía');
      
      const event = { target: { value: '' } };
      
      await component.buscarProductos(event);
      
      console.timeEnd('🧪 Test: Búsqueda vacía');
      
      expect(component.productosFiltrados).toEqual(mockProductos);
    });

    it('should handle search errors', async () => {
      console.time('🧪 Test: Error en búsqueda');
      
      apiServiceSpy.buscarProductos.and.returnValue(Promise.reject('Error de búsqueda'));
      const event = { target: { value: 'test' } };
      
      await component.buscarProductos(event);
      
      console.timeEnd('🧪 Test: Error en búsqueda');
      
      expect(toastServiceSpy.mostrarToastError).toHaveBeenCalledWith('Error en la búsqueda');
    });
  });

  /**
   * Pruebas de filtrado por categoría
   */
  describe('Filtrado por categoría', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('should filter products by category', async () => {
      console.time('🧪 Test: Filtrado por categoría');
      
      const event = { target: { value: 'ropa' } };
      
      await component.filtrarPorCategoria(event);
      
      console.timeEnd('🧪 Test: Filtrado por categoría');
      
      expect(apiServiceSpy.obtenerProductosPorCategoria).toHaveBeenCalledWith('ropa');
      expect(component.categoriaSeleccionada).toEqual('ropa');
      expect(component.productosFiltrados).toEqual(mockProductos.slice(0, 2));
    });

    it('should show all products when no category is selected', async () => {
      console.time('🧪 Test: Sin categoría seleccionada');
      
      const event = { target: { value: '' } };
      
      await component.filtrarPorCategoria(event);
      
      console.timeEnd('🧪 Test: Sin categoría seleccionada');
      
      expect(apiServiceSpy.obtenerProductos).toHaveBeenCalled();
      expect(component.productosFiltrados).toEqual(mockProductos);
    });
  });

  /**
   * Pruebas de gestión de favoritos
   */
  describe('Gestión de favoritos', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('should add product to favorites', async () => {
      console.time('🧪 Test: Agregar favorito');
      
      const producto = mockProductos[0];
      storageServiceSpy.obtenerFavoritos.and.returnValue(Promise.resolve([]));
      
      await component.toggleFavorito(producto);
      
      console.timeEnd('🧪 Test: Agregar favorito');
      
      expect(storageServiceSpy.agregarFavorito).toHaveBeenCalledWith(producto);
      expect(toastServiceSpy.mostrarToastFavorito).toHaveBeenCalledWith(producto.nombre, true);
    });

    it('should remove product from favorites', async () => {
      console.time('🧪 Test: Quitar favorito');
      
      const producto = mockProductos[1];
      
      await component.toggleFavorito(producto);
      
      console.timeEnd('🧪 Test: Quitar favorito');
      
      expect(storageServiceSpy.quitarFavorito).toHaveBeenCalledWith(producto.nombre);
      expect(toastServiceSpy.mostrarToastFavorito).toHaveBeenCalledWith(producto.nombre, false);
    });

    it('should verify if product is favorite', async () => {
      console.time('🧪 Test: Verificar favorito');
      
      const producto = mockProductos[1];
      
      const isFavorite = await component.esFavorito(producto);
      
      console.timeEnd('🧪 Test: Verificar favorito');
      
      expect(isFavorite).toBeTrue();
    });
  });

  /**
   * Pruebas de gestión del carrito
   */
  describe('Gestión del carrito', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('should add product to cart', async () => {
      console.time('🧪 Test: Agregar al carrito');
      
      const producto = mockProductos[0];
      
      await component.agregarAlCarrito(producto);
      
      console.timeEnd('🧪 Test: Agregar al carrito');
      
      expect(carritoServiceSpy.agregarAlCarrito).toHaveBeenCalledWith(producto);
    });

    it('should handle cart errors', async () => {
      console.time('🧪 Test: Error al agregar al carrito');
      
      carritoServiceSpy.agregarAlCarrito.and.returnValue(Promise.reject('Error'));
      const producto = mockProductos[0];
      
      await component.agregarAlCarrito(producto);
      
      console.timeEnd('🧪 Test: Error al agregar al carrito');
      
      expect(toastServiceSpy.mostrarToastError).toHaveBeenCalledWith('Error al agregar al carrito');
    });
  });

  /**
   * Pruebas de navegación
   */
  describe('Navegación', () => {
    it('should navigate to product detail', () => {
      console.time('🧪 Test: Navegación a detalle');
      
      const producto = mockProductos[0];
      
      component.verDetalle(producto);
      
      console.timeEnd('🧪 Test: Navegación a detalle');
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/detalle-producto', producto.nombre]);
    });
  });

  /**
   * Pruebas de métodos auxiliares
   */
  describe('Métodos auxiliares', () => {
    it('should clear filters', () => {
      console.time('🧪 Test: Limpiar filtros');
      
      component.terminoBusqueda = 'test';
      component.categoriaSeleccionada = 'ropa';
      component.productos = mockProductos;
      
      component.limpiarFiltros();
      
      console.timeEnd('🧪 Test: Limpiar filtros');
      
      expect(component.terminoBusqueda).toEqual('');
      expect(component.categoriaSeleccionada).toEqual('');
      expect(component.productosFiltrados).toEqual(mockProductos);
    });

    it('should handle image error', () => {
      console.time('🧪 Test: Error de imagen');
      
      const event = { target: { src: 'invalid-image.jpg' } };
      
      component.onImageError(event);
      
      console.timeEnd('🧪 Test: Error de imagen');
      
      expect(event.target.src).toEqual('assets/img/placeholder.jpg');
    });

    it('should track products by id', () => {
      console.time('🧪 Test: Track by producto');
      
      const producto = mockProductos[0];
      
      const trackValue = component.trackByProducto(0, producto);
      
      console.timeEnd('🧪 Test: Track by producto');
      
      expect(trackValue).toEqual(producto.id);
    });
  });

  /**
   * Pruebas de rendimiento
   */
  describe('Pruebas de rendimiento', () => {
    it('should initialize data within acceptable time', async () => {
      const startTime = performance.now();
      
      await component.ngOnInit();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`⏱️ Tiempo de inicialización: ${executionTime.toFixed(2)}ms`);
      
      // Verificar que tome menos de 1 segundo
      expect(executionTime).toBeLessThan(1000);
    });

    it('should search products quickly', async () => {
      await component.ngOnInit();
      
      const startTime = performance.now();
      
      const event = { target: { value: 'test' } };
      await component.buscarProductos(event);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`⏱️ Tiempo de búsqueda: ${executionTime.toFixed(2)}ms`);
      
      // Verificar que tome menos de 500ms
      expect(executionTime).toBeLessThan(500);
    });
  });
});
