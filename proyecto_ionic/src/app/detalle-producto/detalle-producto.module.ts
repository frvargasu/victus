import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleProductoPage } from './detalle-producto.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleProductoPage, 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleProductoPageModule {}