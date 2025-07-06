import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.component.html',
  styleUrls: ['./geolocalizacion.component.scss'],
  standalone: true,
})
export class GeolocalizacionComponent implements AfterViewInit {
  ngAfterViewInit() {
    const map = L.map('map').setView([51.505, -0.09], 13); // Coordenadas iniciales

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.marker([51.505, -0.09]).addTo(map).bindPopup('Ubicación inicial').openPopup();
  }
}
