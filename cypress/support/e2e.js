// Archivo de soporte para Cypress + Ionic
// Puedes agregar aquí comandos personalizados de Cypress si los necesitas.
// No sobrescribas restoreDom ni manipules el DOM directamente.
// Para máxima compatibilidad, mantén este archivo vacío o solo con helpers estándar.

// Helper: Esperar a que Ionic esté listo antes de cada test
beforeEach(() => {
  cy.window().then(win => {
    if (win.Ionic && typeof win.Ionic.ready === 'function') {
      return win.Ionic.ready();
    }
  });
});

// Ejemplo de comando personalizado:
// Cypress.Commands.add('login', (user, pass) => {
//   cy.get('input[name=username]').type(user);
//   cy.get('input[name=password]').type(pass);
//   cy.get('button[type=submit]').click();
// });
