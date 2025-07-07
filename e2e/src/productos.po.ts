import { browser, by, element } from 'protractor';

export class ProductosPage {
  /**
   * Navega a la página de productos
   */
  async navigateTo(): Promise<unknown> {
    return browser.get('/productos');
  }

  /**
   * Obtiene el título de la página
   */
  async getTitleText(): Promise<string> {
    return element(by.css('ion-title')).getText();
  }

  /**
   * Obtiene la lista de productos
   */
  async getProductList(): Promise<any[]> {
    return element.all(by.css('.producto-card'));
  }

  /**
   * Busca un producto por término
   */
  async searchProduct(searchTerm: string): Promise<void> {
    const searchInput = element(by.css('ion-searchbar input'));
    await searchInput.clear();
    await searchInput.sendKeys(searchTerm);
    await browser.sleep(1000); // Esperar para que se complete la búsqueda
  }

  /**
   * Selecciona una categoría
   */
  async selectCategory(category: string): Promise<void> {
    const categorySelect = element(by.css('ion-select'));
    await categorySelect.click();
    await browser.sleep(500);
    
    const categoryOption = element(by.css(`ion-select-option[value="${category}"]`));
    await categoryOption.click();
    await browser.sleep(1000);
  }

  /**
   * Agrega un producto al carrito
   */
  async addToCart(productIndex: number = 0): Promise<void> {
    const addToCartButtons = element.all(by.css('.add-to-cart-btn'));
    await addToCartButtons.get(productIndex).click();
    await browser.sleep(1000);
  }

  /**
   * Agrega un producto a favoritos
   */
  async addToFavorites(productIndex: number = 0): Promise<void> {
    const favoriteButtons = element.all(by.css('.favorite-btn'));
    await favoriteButtons.get(productIndex).click();
    await browser.sleep(1000);
  }

  /**
   * Obtiene el número de productos mostrados
   */
  async getProductCount(): Promise<number> {
    const products = await this.getProductList();
    return products.length;
  }

  /**
   * Verifica si el loading está visible
   */
  async isLoadingVisible(): Promise<boolean> {
    try {
      const loadingElement = element(by.css('ion-loading'));
      return await loadingElement.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Espera a que desaparezca el loading
   */
  async waitForLoadingToDisappear(): Promise<void> {
    await browser.wait(async () => {
      const isVisible = await this.isLoadingVisible();
      return !isVisible;
    }, 10000, 'Loading no desapareció en 10 segundos');
  }

  /**
   * Verifica si hay un toast visible
   */
  async isToastVisible(): Promise<boolean> {
    try {
      const toastElement = element(by.css('ion-toast'));
      return await toastElement.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el texto del toast
   */
  async getToastText(): Promise<string> {
    const toastElement = element(by.css('ion-toast'));
    return await toastElement.getText();
  }

  /**
   * Limpia los filtros
   */
  async clearFilters(): Promise<void> {
    const clearButton = element(by.css('.clear-filters-btn'));
    await clearButton.click();
    await browser.sleep(1000);
  }

  /**
   * Verifica si un producto específico está visible
   */
  async isProductVisible(productName: string): Promise<boolean> {
    try {
      const productElement = element(by.css(`[data-product-name="${productName}"]`));
      return await productElement.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Hace clic en el botón de refrescar
   */
  async refreshData(): Promise<void> {
    const refreshButton = element(by.css('ion-refresher'));
    await refreshButton.click();
    await browser.sleep(2000);
  }
}
