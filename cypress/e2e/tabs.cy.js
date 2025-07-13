// Cypress E2E test for TabsPage

describe('TabsPage E2E', () => {
  it('should display the tabs page', () => {
    // Cambia la ruta si tu app usa otra base
    cy.visit('/tabs');
    cy.get('ion-tabs').should('exist');
  });
});
