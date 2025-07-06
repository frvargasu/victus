import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProductosPageRoutingModule } from './productos-routing.module';
import { ProductosPage } from './productos.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductosPageRoutingModule,
    SharedModule
  ],
  declarations: [ProductosPage]
})
export class ProductosPageModule {}
