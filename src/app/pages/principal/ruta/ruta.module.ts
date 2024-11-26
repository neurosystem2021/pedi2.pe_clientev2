import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutaPageRoutingModule } from './ruta-routing.module';

import { RutaPage } from './ruta.page';
import { CarritorutaPageModule } from 'src/app/modals/carritoruta/carritoruta.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutaPageRoutingModule,
    CarritorutaPageModule
  ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
