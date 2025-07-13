import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyClpPipe } from '../pipes/currency-clp.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, CurrencyClpPipe],
  exports: [CurrencyClpPipe]
})
export class SharedModule {}
