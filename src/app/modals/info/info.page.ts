import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage {
  @Input() public nombreCliente!: string;
  @Input() public telefono!: number;
  @Input() public precioTotal!: number;
  @Input() public precioDelivery!: number;
  @Input() public detallePedido: any;
  //Detalles del pedido
  constructor(
    readonly modalController: ModalController
    ) {}

  //Cerrar el modal sin realizar ningún cambio
  dismiss(){
    this.modalController.dismiss(null);
  }

}
