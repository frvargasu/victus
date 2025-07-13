import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyClp',
  standalone: true
})
export class CurrencyClpPipe implements PipeTransform {

  transform(value: number | undefined): string {
    if (value == null || value === undefined) {
      return '';
    }
    
    // Formatear número con separador de miles
    const formattedNumber = value.toLocaleString('es-CL');
    
    // Retornar con símbolo de peso chileno
    return `$${formattedNumber} CLP`;
  }
}
