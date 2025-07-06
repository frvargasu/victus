import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { DBTaskService } from './services/DBTask.service';
import { SqliteProductosService } from './services/sqlite-productos.service';
import { GeolocalizacionService } from './services/geolocalizacion.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    DBTaskService,
    SqliteProductosService,
    GeolocalizacionService 
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}