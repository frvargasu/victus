import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyClpPipe } from '../pipes/currency-clp.pipe';

@NgModule({
  declarations: [CurrencyClpPipe],
  imports: [CommonModule],
  exports: [CurrencyClpPipe]
})
export class SharedModule {}
