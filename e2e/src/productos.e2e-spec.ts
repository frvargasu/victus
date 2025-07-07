import { ProductosPage } from './productos.po';

describe('Productos Page', () => {
  let page: ProductosPage;

  beforeEach(() => {
    page = new ProductosPage();
  });

  describe('Carga inicial de datos', () => {
    /**
     * Verifica que la página cargue correctamente
     */
    it('should display productos page title', async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
      
      const title = await page.getTitleText();
      expect(title).toContain('Productos');
    });

    
    it('should load products on page initialization', async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
      
      const productCount = await page.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    
    it('should show and hide loading during initialization', async () => {
      await page.navigateTo();
      
      // El loading debería estar visible inicialmente
      const isLoadingVisible = await page.isLoadingVisible();
      expect(isLoadingVisible).toBeTruthy();
      
      // Esperar a que desaparezca
      await page.waitForLoadingToDisappear();
      
      // Verificar que ya no esté visible
      const isLoadingStillVisible = await page.isLoadingVisible();
      expect(isLoadingStillVisible).toBeFalsy();
    });
  });

  describe('Funcionalidad de búsqueda', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que la búsqueda funcione correctamente
     */
    it('should filter products when searching', async () => {
      const initialProductCount = await page.getProductCount();
      
      await page.searchProduct('camiseta');
      
      const filteredProductCount = await page.getProductCount();
      expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
    });

    /**
     * Verifica que se muestren todos los productos al limpiar búsqueda
     */
    it('should show all products when clearing search', async () => {
      const initialProductCount = await page.getProductCount();
      
      // Buscar algo específico
      await page.searchProduct('camiseta');
      const filteredCount = await page.getProductCount();
      
      // Limpiar búsqueda
      await page.searchProduct('');
      const finalCount = await page.getProductCount();
      
      expect(finalCount).toBe(initialProductCount);
    });
  });

  describe('Funcionalidad de filtrado por categoría', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que el filtrado por categoría funcione
     */
    it('should filter products by category', async () => {
      const initialProductCount = await page.getProductCount();
      
      await page.selectCategory('ropa');
      
      const filteredProductCount = await page.getProductCount();
      expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
    });

    /**
     * Verifica que se muestren todos los productos al seleccionar "Todas"
     */
    it('should show all products when selecting all categories', async () => {
      const initialProductCount = await page.getProductCount();
      
      // Filtrar por una categoría
      await page.selectCategory('ropa');
      const filteredCount = await page.getProductCount();
      
      // Seleccionar todas las categorías
      await page.selectCategory('');
      const finalCount = await page.getProductCount();
      
      expect(finalCount).toBe(initialProductCount);
    });
  });

  describe('Funcionalidad del carrito', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que se pueda agregar un producto al carrito
     */
    it('should add product to cart', async () => {
      await page.addToCart(0);
      
      // Verificar que aparezca el toast de confirmación
      const isToastVisible = await page.isToastVisible();
      expect(isToastVisible).toBeTruthy();
      
      if (isToastVisible) {
        const toastText = await page.getToastText();
        expect(toastText).toContain('agregado al carrito');
      }
    });
  });

  describe('Funcionalidad de favoritos', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que se pueda agregar un producto a favoritos
     */
    it('should add product to favorites', async () => {
      await page.addToFavorites(0);
      
      // Verificar que aparezca el toast de confirmación
      const isToastVisible = await page.isToastVisible();
      expect(isToastVisible).toBeTruthy();
      
      if (isToastVisible) {
        const toastText = await page.getToastText();
        expect(toastText).toContain('favorito');
      }
    });
  });

  describe('Funcionalidad de actualización de datos', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que se puedan refrescar los datos
     */
    it('should refresh data when pull to refresh', async () => {
      await page.refreshData();
      
      // Verificar que aparezca el toast de confirmación
      const isToastVisible = await page.isToastVisible();
      expect(isToastVisible).toBeTruthy();
      
      if (isToastVisible) {
        const toastText = await page.getToastText();
        expect(toastText).toContain('actualizado');
      }
    });
  });

  describe('Limpieza de filtros', () => {
    beforeEach(async () => {
      await page.navigateTo();
      await page.waitForLoadingToDisappear();
    });

    /**
     * Verifica que se puedan limpiar todos los filtros
     */
    it('should clear all filters', async () => {
      const initialProductCount = await page.getProductCount();
      
      // Aplicar filtros
      await page.searchProduct('camiseta');
      await page.selectCategory('ropa');
      
      // Limpiar filtros
      await page.clearFilters();
      
      const finalCount = await page.getProductCount();
      expect(finalCount).toBe(initialProductCount);
    });
  });
});
