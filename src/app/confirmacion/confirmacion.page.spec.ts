import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmacionPage } from './confirmacion.page';
import { Storage } from '@ionic/storage-angular';

describe('ConfirmacionPage', () => {
  let component: ConfirmacionPage;
  let fixture: ComponentFixture<ConfirmacionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionPage],
      providers: [
        { provide: Storage, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(!!component).toBeTrue();
  });
});
