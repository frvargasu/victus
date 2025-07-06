import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GeolocalizacionComponent } from './geolocalizacion/geolocalizacion.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'confirmacion',
    loadChildren: () => import('./confirmacion/confirmacion.module').then( m => m.ConfirmacionPageModule)
  },
  {
    path: 'detalle-producto',
    loadChildren: () => import('./detalle-producto/detalle-producto.module').then( m => m.DetalleProductoPageModule)
  },
  {
    path: 'mi-cuenta',
    loadChildren: () => import('./mi-cuenta/mi-cuenta.module').then( m => m.MiCuentaPageModule)
  },
  {
    path: 'productos',
    loadComponent: () => import('./productos/productos.page').then( m => m.ProductosPage)
  },
  { path: 'geolocalizacion', component: GeolocalizacionComponent },
  { path: '', redirectTo: 'tab3', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}