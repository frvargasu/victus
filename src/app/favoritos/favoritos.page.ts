import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Producto } from '../models/producto';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SharedModule]
})
export class FavoritosPage implements OnInit {
  favoritos: Producto[] = [];

  constructor(private storageService: StorageService) { }

  async ngOnInit() {
    await this.cargarFavoritos();
  }

  async cargarFavoritos() {
    this.favoritos = await this.storageService.obtenerFavoritos();
  }

  async quitarFavorito(nombre: string) {
    await this.storageService.quitarFavorito(nombre);
    await this.cargarFavoritos();
  }

  async limpiarFavoritos() {
    await this.storageService.guardarFavoritos([]);
    await this.cargarFavoritos();
  }
}
