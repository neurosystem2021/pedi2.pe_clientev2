import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AccionesService } from 'src/app/services/acciones.service';
import { Storage } from '@ionic/storage';
import { WebsocketService } from 'src/app/services/websocket.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { GpsService } from 'src/app/services/gps.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit, OnDestroy {
  NombreUsuario: any;
  IdMotorizado:any=null;
  constructor(
    public navCtrl: NavController,
    public accionesService: AccionesService,
    public storage: Storage,
    public wbSocket:WebsocketService,
    public navegacion:NavegacionService,
    public alertController: AlertController,
    public gpsService:GpsService
  ) { }
  
  ngOnInit() {
    this.wbSocket.conectarSocket();
    this.gpsService.getInfoMotorizado();
  }
  //Cargando la vista
  async ionViewWillEnter(){
    //Obtener los datos del motorizado
    let datos = await this.storage.get('localDataMotorizado');
    if(datos != null || datos != undefined){
      this.NombreUsuario = datos.Nombres + " " + datos.Apellidos;
      this.IdMotorizado = datos.IdMotorizado;
    }else{
      this.NombreUsuario = "";
    }
    
  }

  emitir(){
    //this.accionesService.emitirCoordenadasMotorizado()
  }

  ionViewDidLeave(){

  }

  //Ir a las vistas del menu lateral
  async onIrSidemenu(accion: string) {
    switch (accion) {
      case "principal": {
        this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'back' });
        break;
      }
      case "pedido": {
        this.navCtrl.navigateRoot('/principal/pedido', { animationDirection: 'back' });
        break;
      }
      case "cerrarsesion": {
        this.storage.clear();
        this.gpsService.stopSubcriptions();
        this.wbSocket.desconectarSocket();
        this.navCtrl.navigateRoot('/login', { animationDirection: 'back' });
        break;
      }
    }
  }

  ngOnDestroy(){
    //this.wbSocket.desconectarSocket();
  }
}