import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false, // Indica que este componente es independiente
})
export class Tab2Page {
  limpiarInputs() {
    const inputs = document.querySelectorAll('ion-input');
    inputs.forEach((input) => {
      input.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(20px)' },
          { transform: 'translateX(0)' },
        ],
        {
          duration: 1000, // Duración de 1 segundo
          easing: 'ease-in-out',
        }
      );
    });
  }
}