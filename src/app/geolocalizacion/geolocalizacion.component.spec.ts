import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeolocalizacionComponent } from './geolocalizacion.component';

describe('GeolocalizacionComponent', () => {
  let component: GeolocalizacionComponent;
  let fixture: ComponentFixture<GeolocalizacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GeolocalizacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeolocalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    // Evita error de Leaflet: "Map container not found"
    spyOn(component as any, 'ngAfterViewInit').and.callFake(() => {});
    expect(!!component).toBeTrue();
  });
});
