import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarritorutaPageRoutingModule } from './carritoruta-routing.module';

import { CarritorutaPage } from './carritoruta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarritorutaPageRoutingModule
  ],
  declarations: [CarritorutaPage]
})
export class CarritorutaPageModule {}
