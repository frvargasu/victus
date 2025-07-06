import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiCuentaPage } from './mi-cuenta.page';

describe('MiCuentaPage', () => {
  let component: MiCuentaPage;
  let fixture: ComponentFixture<MiCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MiCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
