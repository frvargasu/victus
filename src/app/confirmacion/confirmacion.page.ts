import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular'; // Importa IonicModule
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.page.html',
  styleUrls: ['./confirmacion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule], // Agrega los módulos necesarios
})
export class ConfirmacionPage implements OnInit {
  total: number = 0;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.total = navigation.extras.state['total'];
    }
  }

  ngOnInit(): void {
    // Implementa lógica adicional si es necesario
  }
}