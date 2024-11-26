import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-carritoruta',
  templateUrl: './carritoruta.page.html',
  styleUrls: ['./carritoruta.page.scss'],
})
export class CarritorutaPage implements OnInit {
  @Input() public idPedido:any;
  public Direccion:string = '';
  public Referencia:string = '';
  public EmpresaImagenUrl:any = null;
  public EmpresaRazonSocial:string = '';
  public DetallePedido:any = []
  public PrecioDelivery:number = 0;
  public PrecioProductos:number = 0;
  public Cambio:number = 0;
  public MetodoPago:string = '';
  public Cliente:string = '';
  public FechaReg:any = null;
  loaderToShow: any;
  //public detallePedido:DetallepedidoInterface[]=[];
  constructor(public modalController:ModalController,
    public dataService:DataService,
    public loadingController:LoadingController) { }

  ngOnInit() {
    
  }

  async ionViewWillEnter() {
    try {
      this.loaderToShow = await this.loadingController.create({
        message: 'Cargando compra del cliente...',
        spinner: 'dots',
        mode:"ios",
        backdropDismiss: false,
      });
      await this.loaderToShow.present();
      let respuesta = await this.dataService.getPedidoActivoDetalles(this.idPedido);
      if(respuesta.data.success == true){
        let infoPedido = respuesta.data.data;
        console.log(respuesta.data.data);
        this.Direccion = infoPedido.Direccion;
        this.Cliente = infoPedido.Cliente.Nombres +" "+ infoPedido.Cliente.Apellidos;
        this.EmpresaImagenUrl = infoPedido.Empresa.EmpresaImagenUrl;
        this.EmpresaRazonSocial = infoPedido.Empresa.RazonSocial;
        this.FechaReg = infoPedido.FechaReg;
        this.DetallePedido = infoPedido.DetallePedido;
        this.PrecioDelivery = parseFloat(infoPedido.PrecioDelivery);
        this.PrecioProductos = parseFloat(infoPedido.PrecioProductos);
        this.Cambio = parseFloat(infoPedido.Cambio);
        this.MetodoPago = infoPedido.MetodoPago;
        this.Referencia = infoPedido.Referencia;
        this.loaderToShow.dismiss();
      }else{
        this.closeModal();
        this.loaderToShow.dismiss();
      }
      
    } catch (error) {
      this.loaderToShow.dismiss();
      console.log(error);
    }
  }
  async closeModal() {
    await this.modalController.dismiss();
  }
}
