import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { InfoPage } from 'src/app/modals/info/info.page';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';


declare let L: any;

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage{
  //IdPedido
  IdPedido: any;
  exitePedidoActivo:any;
  //Datos generales del pedido
  datos: any; //Recibe y almacena los datos del pedido
  nombrecliente: any;
  longitudeCliente: any;
  latitudeCliente: any;
  direccion: any;
  ubicacionReferencia: any;
  precioTotal: any;
  precioDelivery: any;
  celular: any;
  //Detalles pedido
  detalle: any;
  //Aceptar pedido
  aceptarPedido: any;
  //Rechazar pedido
  rechazarPedido: any;

  mymap: any;
  casaIcon: any;
  empresaIcon: any;
  
  empresa: any;
  longitudeEmpresa: any;
  latitudeEmpresa: any;
  //Layer
  cliente: any;
  //Loaders
  loaderAceptar: any;
  loaderRechazar: any;
  //CUPERTINO
 
  //Botones
  botonInfo: boolean = false;
  botonAceptar:boolean = false;
  botonRechazar:boolean = false;

  constructor(
    public modalController: ModalController,
    private route: Router,
    public dataService:DataService,
    public storage: Storage,
    public loadingController: LoadingController,
    public toastController: ToastController
  ) {}
  
  //Obetener datos de la API
  async ionViewWillEnter(){
    this.IdPedido = await this.storage.get('idPedidoActivo');
    try {
      this.datos = await this.dataService.getPedidoActivoDetalles(this.IdPedido);
      if(this.datos.data.success){
        this.nombrecliente = this.datos.data.data.Cliente.Nombres + " " + this.datos.data.data.Cliente.Apellidos;
        this.latitudeCliente = this.datos.data.data.Latitud;
        this.longitudeCliente = this.datos.data.data.Longitud;
        this.direccion = this.datos.data.data.Direccion;
        this.ubicacionReferencia = this.datos.data.data.Referencia;
        this.celular = this.datos.data.data.Cliente.Telefono;
        this.precioTotal = this.datos.data.data.PrecioProductos;
        this.precioDelivery = this.datos.data.data.PrecioDelivery;
        this.detalle = this.datos.data.data.DetallePedido;
        //Datos empresa
        this.latitudeEmpresa = this.datos.data.data.Empresa.Latitud;
        this.longitudeEmpresa = this.datos.data.data.Empresa.Longitud;
        this.exitePedidoActivo = true;
      }else{
        const toast = await this.createToaster(3000,'No se encontraron datos del pedido.','danger');
        toast.present();
      }
    } catch (error: any) {
      const toast = await this.createToaster(3000,error,'danger');
      toast.present();
    }
    
  }
  //Cargar el mapa cuando se ingrese a la vista
  async ionViewDidEnter() {
    //MAPA
    try {
      setTimeout(() => {
        this.mymap = new L.map('mapid', { touchZoom: true, attributionControl: false, scrollWheelZoom: false, doubleClickZoom: true }).setView([this.latitudeEmpresa, this.longitudeEmpresa], 13);
        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiamhvbndqIiwiYSI6ImNsaDBycHN6NzB3NWQzZnA3bm93bnJqdTIifQ.lu3qfaK4lH69UW9uLuGx4g",
        {
          maxZoom: 22,
          id: "mapbox/streets-v11",
          accessToken:
            "pk.eyJ1IjoicmVuem85MjIxIiwiYSI6ImNraDRhZ2NxbzA5eHEycW92d2Y1cGhldWUifQ.1zWCqGLtZfq_VSSWJx23Pg",
        }).addTo(this.mymap);

        this.cliente = L.layerGroup().addTo(this.mymap);
        this.empresa = L.layerGroup().addTo(this.mymap);

        this.casaIcon = new L.Icon({
          iconUrl: "../assets/img/casa.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        this.empresaIcon = new L.Icon({
          iconUrl: "../assets/img/location.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        //Ubicación del cliente - Temp
        L.marker([this.latitudeCliente, this.longitudeCliente],{ icon: this.casaIcon}).addTo(
          this.cliente
        );

        this.cargarMapa(this.latitudeEmpresa, this.longitudeEmpresa);
      }, 500);
    } catch (error) {

    }
  }

  //Dibujar un icono en la ubicación del driver
  cargarMapa(lattitude: number, longitude: number) {
    if (this.empresa !== undefined) {
      this.empresa.clearLayers();
      L.marker([lattitude, longitude],{ icon: this.empresaIcon}).addTo(this.empresa);
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: InfoPage,
      cssClass: 'my-custom-class',
      componentProps: {
        nombreCliente: this.nombrecliente,
        telefono: this.celular,
        precioTotal: this.precioTotal,
        precioDelivery: this.precioDelivery,
        detallePedido: this.detalle
      }
    });
    modal.onWillDismiss().then((r) => {
      this.botonInfo = false;

    });
    this.botonInfo = true;
 
    return await modal.present();
  }

  async aceptar(){
    /*
    this.botonAceptar = true;
    this.botonRechazar = true;
    this.toBottom();
    //Loader
    this.loaderAceptar = await this.loadingController.create({
      message: "Aceptando pedido, espere...",
      spinner: "dots",
      backdropDismiss: false,
      mode: "ios",
    });
    this.loaderAceptar.present();
    //Enviamos los datos al servidor
    try {
      this.aceptarPedido = await this.dataService.postEstadoCamino(this.IdPedido);
      this.loaderAceptar.dismiss();
      if(this.aceptarPedido.data.success){
        const toast = await this.createToaster(2000,'¡Pedido aceptado!','success');
        toast.present();
        this.route.navigate(['principal/ruta']);
      }else{
        const toast = await this.createToaster(3000,this.aceptarPedido.data.msg,'danger');
        toast.present();
        this.botonAceptar = false;
        this.botonRechazar = false;
      }
    } catch (error) {
      this.botonAceptar = false;
      this.botonRechazar = false;
      this.loaderAceptar.dismiss();
      const toast = await this.createToaster(3000,error,'danger');
      toast.present();
    }
  }

  async rechazar(){
    this.botonAceptar = true;
    this.botonRechazar = true;
    this.toBottom();
    //Loader
    this.loaderRechazar = await this.loadingController.create({
      message: "Rechazando pedido, espere...",
      spinner: "dots",
      backdropDismiss: false,
      mode: "ios",
    });
    this.loaderRechazar.present();
    //Enviamos los datos al servidor
    try {
      this.rechazarPedido = await this.dataService.postEstadoCamino(this.IdPedido);
      this.loaderRechazar.dismiss();
      //En caso de efectuarse con éxito
      if(this.rechazarPedido.data.success){
        const toast = await this.createToaster(2000,'¡Pedido rechazado!','success');
        toast.present();
        this.route.navigate(['principal/pedido']);
      }else{
        const toast = await this.createToaster(3000,this.aceptarPedido.data.msg,'danger');
        toast.present();
        this.botonAceptar = false;
        this.botonRechazar = false;
      }      
    } catch (error) {
      this.loaderRechazar.dismiss();
      const toast = await this.createToaster(3000,error,'danger');
      toast.present();
      this.botonAceptar = false;
      this.botonRechazar = false;
    }*/
  }

  //Bajar cupertino pane
  toBottom(){
    
  }

  //Crear mensajes loader
  async createLoader(message:string){
    const loader = await this.loadingController.create({
      message: message,
      spinner: "dots",
      backdropDismiss: false,
      mode: "ios",
    });
    return loader;
  }

  //Crear mensajes toaster
  async createToaster(duration:number, message:string,color:string){
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: 'top'
    });
    return toast;
  }
}
