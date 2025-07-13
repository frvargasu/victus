describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/')
    cy.contains('¡Envío gratis por compras sobre $29.990 CLP!')
  })
})
