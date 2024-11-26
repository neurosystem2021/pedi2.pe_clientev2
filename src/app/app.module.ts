import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
const config: SocketIoConfig = {
  url: environment.wsUrl,
  options: { autoConnect: false },
};

//SQLITE
import { IonicStorageModule } from '@ionic/storage-angular';

import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    Vibration,
    LocationAccuracy,
    AndroidPermissions,
    CallNumber,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //,{provide:LOCALE_ID,useValue:'es'}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
