import { Component, OnInit } from '@angular/core';
import { AlertController,LoadingController, MenuController, ModalController, NavController, ToastController} from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { ChatPage } from "src/app/modals/chat/chat.page";
import { Storage } from '@ionic/storage';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccionesService } from 'src/app/services/acciones.service';
import { InfoPage } from 'src/app/modals/info/info.page';
import { WebsocketService } from 'src/app/services/websocket.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { GpsService } from 'src/app/services/gps.service';
import { CarritorutaPage } from 'src/app/modals/carritoruta/carritoruta.page';
import { App } from '@capacitor/app';


declare let L: any;

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit{
  //IDPEDIDO ACTUAL
  IdPedido: any=null;
  //Datos del pedido
  IdMotorizado: any;
  datos: any;
  nombreCliente: any;
  longitudeCliente: any;
  latitudeCliente: any;
  ubicacionReferencia: any;
  celular: any;
  direccion: any;
  precioTotal: any;
  precioDelivery: any;
  //Detalles pedido
  detalle: any;
  //IDCLIENTE
  IdCliente: any;
  mymap: any;
  loaderToShowUbi: any;
  loaderToShow: any;
  casaIcon: any;
  driverIcon: any;
  clienteLayer: any;
  driverLayer: any;
  empresaLayer:any
  longitudeDriver: any = -76.2417719;
  latitudeDriver: any = -9.940175;
  distancia: number = 0;

  latituteActualDriver: any;
  longitudeActualDriver: any;
  tiempoespera: any;

  //Estados
  estado: any;//Estado de los pedidos
  isEnabled1:boolean = false;
  isEnabled2:boolean = false;
  isEnabled3:boolean = false;
  isEnabled4:boolean = false;
  isEnabled5:boolean = false;
  //Chat
  mensajes: any[] = [];
  mensajesSinLeer: number = 0;
  escucharNuevoMensaje!: Subscription;
  escucharEstado!: Subscription;
  escucharCoords!: Subscription;
  //Botones
  botonInfo: boolean = false;
  botonChat: boolean = false;

  //nuevas varaibles
  position:number=0;
  estadoPedidoSubscription!: Subscription;
  public mensajeNuevo:string = '';
  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public storage: Storage,
    public dataService: DataService,
    public route: Router,
    public accionesService: AccionesService,
    public toastController:ToastController,
    public navController:NavController,
    public wbSocket:WebsocketService,
    public navegacionService:NavegacionService,
    public menuController: MenuController,
    public gpsService:GpsService,
    private router: Router,
  ) {}

  ngOnInit(){
    this.menuController.enable(false);
    this.wbSocket.conectarSocket();
    //Escuchar nuevos mensajes y sumar el contador de mensajes sin leer
    this.escucharNuevoMensaje = this.accionesService.mensajeEscuchar().subscribe((resp:any) =>{
      this.mensajesSinLeer++;
      console.log(resp.msg);
      this.mensajeNuevo = (''+resp.msg).length>25?(''+resp.msg).substring(0,25).concat('...'):(''+resp.msg);
      console.log(this.mensajeNuevo);
    });

    //Escuchar cambios de estado emitidos por el administrador de la web
    this.escucharEstado = this.accionesService.escucharEstadoPedido().subscribe(resp =>{
      //this.route.navigate(['principal/pedido']);
    });

    this.estadoPedidoSubscription = this.accionesService
    .escucharEstadaPedidoPlataforma()
    .subscribe(async (resp) => {
      console.log(resp);
      try {
        let respuestaEstado = await this.dataService.getEstadoPedidoActivo(this.IdPedido);
        if(respuestaEstado.data.success==true){
          if (respuestaEstado.data.estado == "F" || respuestaEstado.data.estado == "C") {
            if (
              this.router.isActive("/principal/ruta", true) &&
              this.router.url === "/principal/ruta"
            ) {
              this.mostrarMensajeBottom('EL PEDIDO SE CANCELO DESDE LA PLATAFORMA',2000,'danger')
              this.navController.navigateRoot("/principal/menu", {
                animationDirection: "back",
              });

            }
          }
        }else if(respuestaEstado.data.success==false){
          this.navController.navigateRoot('/principal', { animationDirection: 'back' });
          this.mostrarMensajeBottom('EL PEDIDO SE CANCELO DESDE LA PLATAFORMA',2000,'danger')
        }
      } catch (error) {
        const alert = await this.alertController.create({
          header: "¡Sin conexión!",
          backdropDismiss: false,
          message:
            "No se pudo obtener informacion por favor conectese a internet y renicie la aplicación.",
          mode: "ios",
          buttons: [
            {
              cssClass: "primarybtn",
              text: "Salir",
              handler: () => {
                App.exitApp();
              },
            },
          ],
        });
        await alert.present();    
      }   
    });

  }

/* INICIO DE NUEVAS FUNCIONES*/ 

ionViewWillEnter(){

}

async ionViewWillLeave() {
  this.menuController.enable(true);
}

async obtenerInformacionPedido(){
  //Obtener id motorizado
  let motorizado = await this.storage.get('localDataMotorizado');
  if(motorizado != null || motorizado != undefined){
    this.IdMotorizado = motorizado.IdMotorizado
    await this.mostrarLoader('Recuperando Informacion...');
    try {
      let respuestaPedidoActivo = await this.dataService.getPedidoActivoDetalle(this.IdMotorizado)
        if(respuestaPedidoActivo.data.success==true){
          let pedidoDetalle = respuestaPedidoActivo.data.data;
          this.nombreCliente = pedidoDetalle.Cliente.Nombres + " " + pedidoDetalle.Cliente.Apellidos;
          this.IdCliente = pedidoDetalle.Cliente.IdCliente;
          this.latitudeCliente = pedidoDetalle.Latitud;
          this.longitudeCliente = pedidoDetalle.Longitud;
          this.ubicacionReferencia = pedidoDetalle.Referencia;
          this.celular = pedidoDetalle.Cliente.Telefono;
          this.precioTotal = pedidoDetalle.PrecioProductos;
          this.precioDelivery = pedidoDetalle.PrecioDelivery;
          this.detalle = pedidoDetalle.DetallePedido;
          this.direccion = pedidoDetalle.Direccion;
          this.estado = pedidoDetalle.Estado;
          this.calcularPosicion()
          this.mensajes = pedidoDetalle.Chat!=null && pedidoDetalle.Chat!= ""  ? JSON.parse(pedidoDetalle.Chat) : [];
          this.IdMotorizado = pedidoDetalle.IdMotorizado;
          this.IdPedido = pedidoDetalle.IdPedido;
          //Cargar mapa e informacion de la empresa
          this.latitudeCliente = Number(pedidoDetalle.Latitud)
          this.longitudeCliente = Number(pedidoDetalle.Longitud)
          this.mostrarMapaCliente(this.latitudeCliente,this.longitudeCliente,pedidoDetalle.Cliente.Nombres);
          this.mostrarMapaEmpresa(Number(pedidoDetalle.Empresa.Latitud),Number(pedidoDetalle.Empresa.Longitud),pedidoDetalle.Empresa.RazonSocial)
          this.currentCoords();
        }else{
          this.IdPedido=null;
          this.navController.navigateRoot('/principal', { animationDirection: 'back' })
        }
      this.ocultarLoader();
    } catch (error) {
      this.IdPedido=null;
      console.log(error);
      this.ocultarLoader();
    }
  }else{
    this.navController.navigateRoot('/login', { animationDirection: 'back' })
  }
}

async onUbicacion(){
  if(this.IdPedido!=null){
    const alert = await this.alertController.create({
      header: 'Ubicación del cliente',
      message: "¿Está en la ubicación exacta del cliente?",
      mode:"ios",
      buttons: [
        {
          cssClass: 'secondarybtn', 
          text: 'No',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          cssClass: 'primarybtn', 
          text: 'Sí, estoy aquí',
          handler: async () => {
            try {
              let respuestaUbicacion = await this.dataService.postEstadoUbicacion(this.IdPedido, this.IdMotorizado)
              if(respuestaUbicacion.data.success==1){
                this.estado = respuestaUbicacion.data.estado;
                this.calcularPosicion()
                this.mostrarMensajeBottom(respuestaUbicacion.data.msg,2000,'success')
                this.accionesService.estadoActualizar(this.IdCliente,this.IdPedido,'UC',respuestaUbicacion.data.facturaUrl ,respuestaUbicacion.data.idAlmacen,respuestaUbicacion.data.idRegion);
              }else if(respuestaUbicacion.data.success==2){
                this.mostrarMensajeBottom(respuestaUbicacion.data.msg,2000,'warning')
                if(respuestaUbicacion.data.estado == 'F' || respuestaUbicacion.data.estado == 'C' || respuestaUbicacion.data.estado == 'PE' || respuestaUbicacion.data.estado == 'E' ){
                  this.navController.navigateRoot('/principal', { animationDirection: 'back' })
                }else{
                 this.estado = respuestaUbicacion.data.estado;
                 this.calcularPosicion()
                }
              }else {
                this.obtenerInformacionPedido();
              }
            } catch (error) {
              
            }
          }
        }
      ]
    });
  
    await alert.present();

  }else{
    this.navController.navigateRoot('/principal', { animationDirection: 'back' })
  }

}

  async onFinalizar(){
  if(this.IdPedido!=null){
    const alert = await this.alertController.create({
      header: 'Finalizar Viaje',
      message: "¿Ya entregó el pedido al cliente?",
      mode:"ios",
      buttons: [
        {
          cssClass: 'secondarybtn', 
          text: 'No',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          cssClass: 'primarybtn', 
          text: 'Sí, finalizar',
          handler: async () => {
            try {
              let respuestaUbicacion = await this.dataService.postEstadoFinalizado(this.IdPedido, this.IdMotorizado)
              if(respuestaUbicacion.data.success==1){
                this.estado = respuestaUbicacion.data.estado;
                this.calcularPosicion()
                this.mostrarMensajeBottom(respuestaUbicacion.data.msg,2000,'success')
                this.accionesService.estadoActualizar(this.IdCliente,this.IdPedido,'F',respuestaUbicacion.data.facturaUrl ,respuestaUbicacion.data.idAlmacen,respuestaUbicacion.data.idRegion);
                this.navController.navigateRoot('/principal', { animationDirection: 'back' })
              }else if(respuestaUbicacion.data.success==2){
                this.mostrarMensajeBottom(respuestaUbicacion.data.msg,2000,'warning')
                if(respuestaUbicacion.data.estado == 'F' || respuestaUbicacion.data.estado == 'C' || respuestaUbicacion.data.estado == 'PE' || respuestaUbicacion.data.estado == 'E' ){
                  this.navController.navigateRoot('/principal', { animationDirection: 'back' })
                }else{
                 this.estado = respuestaUbicacion.data.estado;
                 this.calcularPosicion()
                }
              }else {
                this.obtenerInformacionPedido();
              }
            } catch (error) {
              
            }
          }
        }
      ]
    });
  
    await alert.present();

  }else{
    this.navController.navigateRoot('/principal', { animationDirection: 'back' })
  }
}

calcularPosicion(){
  switch (this.estado) {
    case 'PU':
      this.position = 1;
      break;

    case 'UC':
      this.position = 2;
      break;

    case 'F':
      this.position = 3;
      break;

    default:
      break;
   }
}

  //Cargar el mapa cuando se ingrese a la vista
  async ionViewDidEnter() {

    //Dibujar el mapa
    try {
      setTimeout(() => {
        this.mymap = new L.map('mapidd', { attributionControl: false, scrollWheelZoom: false, doubleClickZoom: true }).setView([this.latitudeDriver, this.longitudeDriver], 13);
        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiamhvbndqIiwiYSI6ImNsaDBycHN6NzB3NWQzZnA3bm93bnJqdTIifQ.lu3qfaK4lH69UW9uLuGx4g",
        {
          maxZoom: 22,
          id: "mapbox/streets-v11",
          accessToken:
            "pk.eyJ1IjoicmVuem85MjIxIiwiYSI6ImNraDRhZ2NxbzA5eHEycW92d2Y1cGhldWUifQ.1zWCqGLtZfq_VSSWJx23Pg",
        }).addTo(this.mymap);

        this.clienteLayer = L.layerGroup().addTo(this.mymap);
        this.driverLayer= L.layerGroup().addTo(this.mymap);
        this.empresaLayer = L.layerGroup().addTo(this.mymap);

        this.casaIcon = new L.Icon({
          iconUrl: "../assets/img/casa.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        this.driverIcon = new L.Icon({
          iconUrl: "../assets/img/moto.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        this.obtenerInformacionPedido();
      }, 1000);
    } catch (error) {

    }
  }

    //Calcular la distancia entre el driver y el cliente
    getDistance(
      latStart: number,
      longStart: number,
      latEnd: number,
      longEnd: number
    ): number {
      const R = 6371; // Radius of the earth in km
      const dLat = this._deg2rad(latEnd - latStart);
      const dLong = this._deg2rad(longEnd - longStart);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this._deg2rad(latStart)) *
          Math.cos(this._deg2rad(latEnd)) *
          Math.sin(dLong / 2) *
          Math.sin(dLong / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
  
      return +d.toFixed(5) * 1000;
    }
    _deg2rad(deg: any) {
      return deg * (Math.PI / 180);
    }

 
 
  mostrarMapaDriver(lattitude: number, longitude: number) {
    if (this.driverLayer !== undefined) {
      this.driverLayer.clearLayers();
      L.marker([lattitude, longitude],{ icon: this.driverIcon}).addTo(this.driverLayer);
    }
  }
  mostrarMapaEmpresa(lattitude: number, longitude: number,RazonSocial:string) {

    if (this.empresaLayer !== undefined) {
      this.empresaLayer.clearLayers();
      L.marker([lattitude, longitude],{ icon: this.casaIcon}).addTo(this.empresaLayer)
        .bindPopup("<b>" + RazonSocial + "</b>").openPopup();
    }
  }

  mostrarMapaCliente(lattitude: number, longitude: number, Nombre:string) {
    if (this.clienteLayer !== undefined) {
      this.clienteLayer.clearLayers();
      L.marker([lattitude, longitude]).addTo(this.clienteLayer)
        .bindPopup("<b>" + Nombre + "</b>").openPopup();
    }
  }

  currentCoords(){
    this.tiempoespera = setInterval(()=>{
      let dataCoords = this.gpsService.getCoordenadasMotorizado();
      if(dataCoords.latitud != null && dataCoords.longitud !=null){
        this.latituteActualDriver = dataCoords.latitud ;
        this.longitudeActualDriver =  dataCoords.longitud;
        this.mostrarMapaDriver(this.latituteActualDriver,this.longitudeActualDriver);
        this.distancia = this.getDistance(this.latituteActualDriver,this.longitudeActualDriver,this.latitudeCliente,this.longitudeCliente);
        this.accionesService.emitirUbicacion(this.IdMotorizado,this.IdCliente,this.IdPedido,this.latituteActualDriver,this.longitudeActualDriver);
      }
    },8000);
  }

  

  async mostrarMensajeBottom(mensaje:string,duracion:number,color:string){
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      position: 'bottom',
      mode: "ios",
      color: color,
      buttons: [
        {
          icon: "close",
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
  }

  async mostrarLoader(mensaje:string){
    this.loaderToShow = await this.loadingController.create({
      message: mensaje,
      spinner: 'dots',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();
  }

  ocultarLoader(){
    this.loaderToShow.dismiss();
  }

   //Vista abandonada
  ionViewDidLeave(){
    this.escucharNuevoMensaje.unsubscribe();
    this.escucharEstado.unsubscribe();
    this.estadoPedidoSubscription.unsubscribe();
    //this.escucharCoords.unsubscribe();
    clearInterval(this.tiempoespera);
  }

  onSalir() {
    App.minimizeApp()
  }

  //Abrir chat
  async abrirChat() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        mensajes: this.mensajes,
        nombreCliente: this.nombreCliente,
        IdCliente: this.IdCliente,
        IdPedido:this.IdPedido,
        telefonoCliente:this.celular
      },
      showBackdrop: true,
      animated: true,
      backdropDismiss: false,
    });
    modal.onWillDismiss().then((r) => {
      this.botonInfo = false;
      this.botonChat = false;
     
      this.mensajesSinLeer = 0;
     /* this.escucharNuevoMensaje = this.accionesService.mensajeEscuchar().subscribe(resp =>{
        this.mensajesSinLeer++;
        this.refrescarMensajesCliente();
      });*/
    });
    this.botonInfo = true;
    this.botonChat = true;

    //this.escucharNuevoMensaje.unsubscribe();
    return await modal.present();
  }

  async abrirCarritoRuta() {
    if(this.IdPedido!=null){
    const modal = await this.modalController.create({
      component: CarritorutaPage,
      componentProps: {
        idPedido: this.IdPedido,
      },
      showBackdrop: true,
      animated: true,
      backdropDismiss: false,
    });

    modal.onWillDismiss().then((r) => {});

    return await modal.present();
    }
  }

  //Refrescar mensajes cuando un cliente envia un mensaje
  async refrescarMensajesCliente(){
    try {
      let data = await this.dataService.getMensajes(this.IdPedido);
      this.mensajes = data.data.chat!=null && data.data.chat!= ""  ? JSON.parse(data.data.chat) : []; 
    } catch ( error: any) {
      const toast = await this.createToaster(3000,error,'danger');
      toast.present(); 
    }
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
      color: color
    });
    return toast;
  }

  //Modal con la información del pedido
  async presentModal() {
    const modal = await this.modalController.create({
      component: InfoPage,
      cssClass: 'my-custom-class',
      componentProps: {
        nombreCliente: this.nombreCliente,
        telefono: this.celular,
        precioTotal: this.precioTotal,
        precioDelivery: this.precioDelivery,
        detallePedido: this.detalle
      }
    });
    this.botonInfo = true;
    this.botonChat = true;
    modal.onWillDismiss().then((r) => {
      this.botonInfo = false;
      this.botonChat = false;
    });
 
    return await modal.present();
  }

  //Bajar cupertino pane
  toBottom(){
  
  }

/* FIN DE NUEVAS FUNCIONES*/ 


}