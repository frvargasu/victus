import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConfirmacionPageRoutingModule } from './confirmacion-routing.module';

import { ConfirmacionPage } from './confirmacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmacionPageRoutingModule,
    RouterModule.forChild([{ path: '', component: ConfirmacionPage }]),
    ConfirmacionPage, // Importa el componente standalone
  ],
})
export class ConfirmacionPageModule {}