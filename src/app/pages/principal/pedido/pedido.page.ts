import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccionesService } from 'src/app/services/acciones.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Storage } from '@ionic/storage';
import { DataService } from 'src/app/services/data.service';
import { GpsService } from 'src/app/services/gps.service';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit, OnDestroy{
  escucharNuevoViaje!: Subscription;
  escucharEstadoPedidoPlat!: Subscription;
  EmpresasMotorizado: any=[];//Array que almacena las empresas activas del motorizado
  loaderToShow: any;
  IdMotorizado: any;
  //nuevas variables
  solicitudes:any=[];
  EmpresasMotorizadoAdicionales:any=[];
  tienesolic: any = new Audio('assets/audio/pedido/tienesolic.mp3')

  ngOnInit(){
    //Conectar con el socket
    this.wbSocket.conectarSocket();
    //Escuchar nuevos pedidos
     
    this.escucharNuevoViaje = this.accionesService.nuevoViaje().subscribe(async resp =>{
      //Actualizar los datos del motorizado
      let motorizado = await this.storage.get('localDataMotorizado');
      if(motorizado != null || motorizado != undefined){
        await this.obtenerEmpresasAsignadas(this.IdMotorizado);
        await this.obtenerPedidosActivos(this.IdMotorizado);
      }
    });

    this.escucharEstadoPedidoPlat = this.accionesService.escucharEstadaPedidoPlataforma().subscribe(async resp =>{
      //Actualizar los datos del motorizado
      this.actualizar();
    });

    this.wbSocket.ob.subscribe((result) => {
      this.actualizar();
    });
  }

  constructor(
    private route: Router,
    public accionesService: AccionesService,
    public wbSocket: WebsocketService,
    public loadingController: LoadingController,
    public dataService: DataService,
    public storage: Storage,
    public toastController:ToastController,
    public navController:NavController,
    public alertController:AlertController,
    public gpsService:GpsService,
    private vibration: Vibration
  ) {
  }
  ngOnDestroy(): void {
    try {
      this.escucharNuevoViaje.unsubscribe();
      this.escucharEstadoPedidoPlat.unsubscribe();
      this.tienesolic.pause();
    } catch (error) {
      console.log("error");
    }
  }
  

  /* INICIO DE NUEVAS FUNCIONES*/

  async ionViewWillEnter(){
    this.cargarIni()
  }

  async actualizar(){
    await this.obtenerEmpresasAsignadas(this.IdMotorizado);  
    await this.obtenerPedidosActivos(this.IdMotorizado)
  }

  async cargarIni(){
    this.solicitudes = []
    this.EmpresasMotorizadoAdicionales = []
    this.EmpresasMotorizado = []
    let motorizado = await this.storage.get('localDataMotorizado');
    if(motorizado != null || motorizado != undefined){
      this.IdMotorizado = motorizado.IdMotorizado
      try {
        let respuestaPedidoActivo = await this.dataService.getPedidoActivoId(this.IdMotorizado);
        console.log(respuestaPedidoActivo);
        if(respuestaPedidoActivo.data.success==true){
          this.navController.navigateRoot('/principal/ruta', { animationDirection: 'forward' });
          this.mostrarMensajeBottom("Existe un pedido en proceso...",2000,'success');
        }else if(respuestaPedidoActivo.data.success==false){
          await this.obtenerEmpresasAsignadas(this.IdMotorizado);  
          await this.obtenerPedidosActivos(this.IdMotorizado);
        }
      } catch (error) {
        
      }

    }else{
      this.navController.navigateRoot('/login', { animationDirection: 'back' })
    }
  }

  doVibrationFor(ms: any){
    try {
      this.vibration.vibrate(ms);
    } catch (error) {
      
    }
  }
  
  async obtenerEmpresasAsignadas(IdMotorizado: any){
    this.EmpresasMotorizado = []
    try {
      let empresasActivas = await this.dataService.getEmpresasActivas(IdMotorizado);
      this.EmpresasMotorizado = empresasActivas.data.data;
      if(this.EmpresasMotorizado.length>0){
        if(this.EmpresasMotorizado[0].MotorizadoAnulado==1){
          this.storage.clear();
          this.gpsService.stopSubcriptions();
          this.wbSocket.desconectarSocket();
          const alert = await this.alertController.create({
            header: '¡Cuenta bloqueada!',
            backdropDismiss: false,
            message: "Se ha bloqueado el acceso para este usuario, si es un error comunicate con nosotros (+51 997 578 199)</strong>.",
            mode: "ios",
            buttons: [
              {
                cssClass: 'primarybtn',
                text: 'Entiendo',
                handler: () => {
                }
              }
            ]
          });
          await alert.present();
          this.navController.navigateRoot('/login', { animationDirection: 'back' });
        }
      }
    } catch (error) {
      
    }
  }
  async obtenerPedidosActivos(IdMotorizado: any){
    this.solicitudes = []
    this.EmpresasMotorizadoAdicionales = []
    try {
      let pedidoSolicitud = await this.dataService.getPedidosSolicitud(IdMotorizado);
      if(pedidoSolicitud.data.success==true){
        this.solicitudes = pedidoSolicitud.data.data;
        let letidempresas = this.EmpresasMotorizado.map((emp: any)=>emp.IdEmpresa)
        this.mostrarMensajeBottom(pedidoSolicitud.data.msg,2000,"success")
        try {
          this.tienesolic.pause('tienesolic');
        } catch (error) {
          console.log("error");
        }
        try {
           this.tienesolic.loop('tienesolic');
        } catch (error) {
          console.log("error");
        }
        this.doVibrationFor(4000)
        this.EmpresasMotorizadoAdicionales = this.solicitudes.map((se: any)=>{
          if(!(letidempresas.includes(se.IdEmpresa))){
            return {IdEmpresa:se.IdEmpresa,RazonSocial:se.Empresa,ImagenUrl:se.ImagenUrl}
          }
          return [];
        }).filter((v: any,i: any,a: any)=>a.findIndex((v2: any)=>(v2.IdEmpresa===v.IdEmpresa))===i)
      }else{
        this.solicitudes=[];
        try {
          this.tienesolic.pause('tienesolic');
        } catch (error) {
          console.log("error");
        }
      }
    } catch (error) {
      console.log("error");
    }
  }

  filtro(IdEmpresa: number) {
    return this.solicitudes.filter((solicitud:any) => solicitud.IdEmpresa == IdEmpresa);
  }

  ionViewDidLeave(){
    try {
      this.escucharNuevoViaje.unsubscribe();
      this.escucharEstadoPedidoPlat.unsubscribe();
      this.tienesolic.pause('tienesolic');
    } catch (error) {
      console.log("error");
    }
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

  async iniciarViaje(idcliente:number,idPedido:number,idregion:number){
    const alert = await this.alertController.create({
      header: 'Iniciar Viaje',
      message: "¿Esta seguro de iniciar el viaje solicitado?",
      mode:"ios",
      buttons: [
        {
          cssClass: 'secondarybtn', 
          text: 'Atrás',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          cssClass: 'primarybtn', 
          text: 'Iniciar',
          handler: async () => {
           
            try {
              let respuestaIniciar = await this.dataService.postEstadoCamino(idPedido,this.IdMotorizado);
              if(respuestaIniciar.data.success==1){
                this.mostrarMensajeBottom(respuestaIniciar.data.msg,2000,'success')
                this.accionesService.estadoActualizar(idcliente,idPedido,'PU',respuestaIniciar.data.facturaUrl ,respuestaIniciar.data.idAlmacen,respuestaIniciar.data.idRegion);
                this.navController.navigateRoot('/principal/ruta', { animationDirection: 'forward' })
              }else if(respuestaIniciar.data.success==2){
                this.mostrarMensajeBottom(respuestaIniciar.data.msg,2000,'warning')
                if(respuestaIniciar.data.estado == 'PU' || respuestaIniciar.data.estado == 'UC' ){
                  this.navController.navigateRoot('/principal/ruta', { animationDirection: 'forward' })
                }else{
                  this.actualizar();
                }
              }else {
                this.actualizar();
              }
            } catch (error) {
              
            }
          }
        }
      ]
    });
  
    await alert.present();
  }


  /* FIN DE NUEVAS FUNCIONES*/
}
