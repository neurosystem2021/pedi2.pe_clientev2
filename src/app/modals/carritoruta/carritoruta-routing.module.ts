import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarritorutaPage } from './carritoruta.page';

const routes: Routes = [
  {
    path: '',
    component: CarritorutaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarritorutaPageRoutingModule {}
