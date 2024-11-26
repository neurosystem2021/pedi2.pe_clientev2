import { Injectable } from '@angular/core';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import {FCM} from '@awesome-cordova-plugins/fcm';
import { Subject } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socketStatus = false;
  public hasPermission: any;
  public token: string='';
  public pushPayload: any;
  readonly mySubject = new Subject<any>();
  ob = this.mySubject.asObservable();
  msg: any = new Audio('assets/audio/notificacion/msg.mp3')
  chat: any = new Audio('assets/audio/notificacion/chat.mp3')


  constructor(
    private socket: Socket,
    private navController: NavController,
    public alertController: AlertController,
    private router: Router,
    private storage: Storage,
    private platform: Platform,
    private modalController:ModalController,
    private dateService:DataService
  ) {
    this.setupFCM();
    this.checkStatus();
   
  }

  async conectarSocket() {
    this.socket.connect();

 }
 private async setupFCM() {
  await this.platform.ready();
  console.log('FCM setup started');

  if (!this.platform.is('cordova')) {
    return;
  }
  console.log('In cordova platform');

  /*console.log('Subscribing to token updates');
  FCM.onTokenRefresh().subscribe((newToken) => {
    this.token = newToken;
    console.log('onTokenRefresh received event with: ', newToken);
  });*/

  console.log('Subscribing to new notifications');
  FCM.onNotification().subscribe(async (payload: any) => {
    this.pushPayload = payload;
    /*
    if (payload.wasTapped) {
      this.herramientasService.showAlert(JSON.stringify(this.pushPayload));
    } else {
      this.herramientasService.showAlert2(JSON.stringify(this.pushPayload));
    }*/

    if(payload.motorizado){
      if (this.router.isActive('/principal/pedido', true) && this.router.url === '/principal/pedido') {
        this.mySubject.next(1);
      }
     
      /*
      let cliente = await this.storage.get('cliente');
      if (cliente != null) {
        try {
          let respuestaPedido = await this.dataService.getPedidoExisteDetalle(Number(cliente.IdCliente));
          if(respuestaPedido.data.success==true){
            let respuestaPedidoInfo=respuestaPedido.data.data;
            this.herramientasService.setEstado(respuestaPedidoInfo.Estado);

          }else if(respuestaPedido.data.success==false){
            
            if (this.router.isActive('/ruta', true) && this.router.url === '/ruta') {
              this.navController.navigateRoot('/principal', { animationDirection: 'forward' });
            }
          }
        } catch (error) {
          
        }
      }*/
    }

    if(payload.mensaje && !payload.wasTapped){
      if (this.router.isActive('/principal/ruta', true) && this.router.url === '/principal/ruta') {

        try {
          const element = await this.modalController.getTop();
          if (!element) {
            this.msg.play('msg');
          }else{
            this.chat.play('chat');  
          }
        } catch (error) {
          console.log("error");
        }
      }
    }
    
  });

}

subscribeToTopic() {
  FCM.subscribeToTopic('enappd');
}
getToken() {
  FCM.getToken().then(token => {
    // Register your new token in your back-end if you want
    // backend.registerToken(token);
  });
}
unsubscribeFromTopic() {
  FCM.unsubscribeFromTopic('enappd');
}

  async checkStatus() {
 
    this.socket.on('connect', async () => {
      try {
        let datosMotorizado = await this.storage.get('localDataMotorizado');
        if (datosMotorizado != null) {
          let idRegion = 0
          try {
            this.token = await FCM.getToken();
          } catch (error) {
            
          }
          try {
            let respuestamoto = await this.dateService.getMotorizadoGrupo(datosMotorizado.IdMotorizado)
            if(respuestamoto.data.success){
              idRegion = respuestamoto.data.idRegion
            }
          } catch (error) {
              idRegion = 0
          }
          this.socket.emit(
            'conectar',
            { tipo: 'MOTORIZADO', objeto:{iddb: datosMotorizado.IdMotorizado, nombres:datosMotorizado.Nombres, apellidos:datosMotorizado.Apellidos,token:this.token,idregion:idRegion} },
            async (resp: any) => {
              switch (resp['existe']) {
                case true: {
                     if (
                       !this.router.isActive('/login', true) &&
                       this.router.url !== '/login'
                     ) {
                       this.navController.navigateRoot('/login');
                     }
                     const alert = await this.alertController.create({
                       header:
                         '¡Solo puede usar la aplicación en 1 dispositivo!',
                       backdropDismiss: false,
                       message:
                         'Su cuenta ya está ejecutandosé en otro dispositivo, por favor cierre sesión en el otro dispositivo e intente nuevamente en este.',
                       mode: 'ios',
                       buttons: [
                         {
                           cssClass: 'primarybtn',
                           text: 'Entiendo',
                           handler: () => {},
                         },
                       ],
                     });
                     await alert.present();
                     await this.storage.remove('localDataMotorizado');
                     this.socketStatus = false;
                     this.desconectarSocket();
                  break;
                }
                case false: {
                  console.log('Connectado al servidor');
                  this.socketStatus = true;  
                  if (
                    this.router.isActive('/inicio', true) &&
                    this.router.url === '/inicio'
                  ) {
                    this.navController.navigateRoot('/principal', {
                      animationDirection: 'forward',
                    });
                  }

                  if (
                    this.router.isActive('/login', true) &&
                    this.router.url === '/login'
                  ) {
                    this.navController.navigateRoot('/principal', {
                      animationDirection: 'forward',
                    });
                  }
                                  
                  break;
                }
                default: {
                  console.log('Error conectar socket');
                  break;
                }
              }
            }
          );
        } else {
          this.desconectarSocket();
          this.navController.navigateRoot('/login');
        }
      } catch (error) {
        
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.socketStatus = false;
    });
  }

  desconectarSocket() {
    console.log("desconectar");
    this.socket.disconnect();
  }

  //Emita cuaquier evento
  emit(evento: string, payload?: any, callback?: Function) {
    //  console.log("Emitiendo ", evento);
    this.socket.emit(evento, payload, callback);
  }

  //Escuchar cualquier evento
  listen(evento: string) {
    return this.socket.fromEvent(evento);
  }
}