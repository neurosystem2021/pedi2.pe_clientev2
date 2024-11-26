import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  localUserLog: any;
  pedidoActivo: any;
  public cargando:boolean=false;
  constructor(
    private route: Router,
    private storage: Storage,
    private dataService: DataService,
    public toastController: ToastController,
    public navController: NavController,
    public alertController: AlertController
  ) { }

  ngOnInit() {
  }
  async ionViewDidEnter() {
    setTimeout(() => {
      this.cargando=true
    }, 200);
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

  ionViewWillLeave() {
   const logo = document.getElementById('logo');
   if (logo) {
    logo.innerHTML = "";
   }
  }

  async ionViewWillEnter(){
    this.localUserLog = await this.storage.get('localDataMotorizado');
    if(this.localUserLog != null){
      try {
        let IdMotorizado = this.localUserLog.IdMotorizado;
        this.pedidoActivo = await this.dataService.getPedidoActivoId(IdMotorizado);
        //En caso de existir un pedido redireccionar a la vista ruta
        if(this.pedidoActivo.data.success){
          await this.storage.set('idPedidoActivo',this.pedidoActivo.data.idPedido);
          this.route.navigate(['principal/ruta']);
          this.navController.navigateRoot('/principal/ruta', { animationDirection: 'forward' });
        }else{
          const toast = await this.createToaster(2000,this.pedidoActivo.data.msg,'primary');
          toast.present();
          this.navController.navigateRoot('/principal/pedido', { animationDirection: 'forward' });
        }
      } catch (error: any) {
        const toast = await this.createToaster(3000,error,'danger');
        toast.present();
        //this.route.navigate(['principal/pedido']);
      }
    }else{
      this.navController.navigateRoot('/login', { animationDirection: 'forward' });
    }
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
}