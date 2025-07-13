// Test E2E para tabs principales: inicio, favoritos, perfil (tab1, tab2, tab3)
describe('Tabs principales', () => {
  it('debe mostrar la página de inicio (tab1)', () => {
    cy.visit('/tabs/tab1');
    cy.get('ion-content').should('exist');
    cy.contains(/inicio|home/i);
  });

  it('debe mostrar la página de favoritos (tab2)', () => {
    cy.visit('/tabs/tab2');
    cy.get('ion-content').should('exist');
    cy.contains(/favoritos|favorites/i);
  });

  it('debe mostrar la página de perfil (tab3)', () => {
    cy.visit('/tabs/tab3');
    cy.get('ion-content').should('exist');
    cy.contains(/perfil|profile/i);
  });
});
