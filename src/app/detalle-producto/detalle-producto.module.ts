import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';

import { DetalleProductoPageRoutingModule } from './detalle-producto-routing.module';
import { DetalleProductoPage } from './detalle-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleProductoPageRoutingModule,
    SharedModule
  ],
  declarations: [DetalleProductoPage]
})
export class DetalleProductoPageModule {}