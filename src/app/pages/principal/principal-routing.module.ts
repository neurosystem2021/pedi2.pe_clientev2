import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrincipalPage } from './principal.page';

const routes: Routes = [
  {
    path: '',
    component: PrincipalPage,
    children: [
      {
        path: '',
        redirectTo: 'pedido',
        pathMatch: 'full', // Asegúrate de incluir pathMatch
      },
      {
        path: 'pedido',
        loadChildren: () =>
          import('./pedido/pedido.module').then((m) => m.PedidoPageModule),
      },
      {
        path: 'ruta',
        loadChildren: () =>
          import('./ruta/ruta.module').then((m) => m.RutaPageModule),
      },
      {
        path: 'ubicacion',
        loadChildren: () =>
          import('./ubicacion/ubicacion.module').then((m) => m.UbicacionPageModule),
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalPageRoutingModule {}
