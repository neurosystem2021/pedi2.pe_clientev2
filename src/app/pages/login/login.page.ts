import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInput, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = "";
  password: string = "";
  format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  datosMotorizado: any;
  showPassword = false;
  @ViewChild('passinput',{static:false}) input!: IonInput;
  constructor(
    readonly storage: Storage,
    readonly dataService: DataService,
    public navController: NavController,
    public toastController: ToastController,
    public alertController:AlertController,
    private router: Router
    ) { }

  ngOnInit() {
  }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }
  //No aceptar caracteres especiales
  onKeyDown(event: any){
    if(this.format.test(event.key)){
      return false;
    }
    return true;
  }

  //Inicar sesión Botón-Enter
  async iniciarSesion(){
    try {
      this.datosMotorizado = await this.dataService.getLogginMotorizado(this.username,this.password);
      if(this.datosMotorizado.data.success){
        this.storage.set('localDataMotorizado',this.datosMotorizado.data.data);
        const toast = await this.toastController.create({
          message: '¡Bienvenido!',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        //this.navController.navigateRoot('/principal/pedido', { animationDirection: 'forward' });
        this.router.navigate(['/principal/pedido'])
      }else{
        const toast = await this.toastController.create({
          message: this.datosMotorizado.data.msg,
          duration: 2000,
          color: 'danger'
        });
        toast.present();

        if(this.datosMotorizado.data.anulado==1){
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
        }
      }      
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error,
        duration: 2000,
        color: 'danger'
      });
      toast.present(); 
    }
  }

  async lostPass(){
    const alert = await this.alertController.create({
      header: '¡Comunicate con nosotros!',
      backdropDismiss: false,
      message: "Comunicate con nosotros vía whastapp (+51 997 578 199) para recuperar su cuenta.",
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
  }

}
