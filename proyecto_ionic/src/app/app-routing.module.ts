import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}