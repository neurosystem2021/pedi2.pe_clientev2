import { Component, OnInit } from '@angular/core';

import { Platform, NavController, AlertController, ModalController, PopoverController, ActionSheetController, MenuController, LoadingController } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Router } from '@angular/router';
import { NavegacionService } from './services/navegacion.service';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private valor = 0;
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private router: Router,
    private navController: NavController,
    private alertController: AlertController,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private navegacionService: NavegacionService,
    private storage: Storage
  ) {
    this.initializeApp();
  }
  async ngOnInit() {
    await this.storage.create();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#FBFBFB');
      this.statusBar.styleDefault();
      //backbutton
      document.addEventListener("backbutton", async () => {


        // close popover
        try {
          const element = await this.popoverController.getTop();
          if (element) {
            element.dismiss();
            return;
          }
        } catch (error) {
        }

        // close modal
      
        //
        try {
          const element = await this.alertController.getTop();
          if (element) {
            if(!this.router.isActive('/login', true) && this.router.url !== '/login'){
              return;
            }else if(!this.router.isActive('/principal/ruta', true) && this.router.url !== '/principal/ruta'){
              return;
            }else if(!this.router.isActive('/principal/pedido', true) && this.router.url !== '/principal/pedido'){
              return;
            }else{
              element.dismiss();
              return;
            }
            
          }
        } catch (error) {
          console.log(error);

        }
         

        // close modal
        try {
          const element = await this.modalController.getTop();
          if (element && (!this.router.isActive('/login', true) && this.router.url !== '/login')) {
            element.dismiss();
            return;
          }
        } catch (error) {
          console.log(error);

        }
        //close side mnenu
        try {
          const element = await this.menuController.isOpen('first');
          if (element !== false) {
            this.menuController.toggle();
            return;

          }

        } catch (error) {

        }

        if (this.router.isActive('/login', true) && this.router.url === '/login' && this.valor == 0) {
          this.valor = 1;
          const alert = await this.alertController.create({
            header: '¿Desea cerrar la App?',
            backdropDismiss: false,
            mode:"ios",
            buttons: [
              {
                cssClass: 'secondarybtn', 
                text: 'Cancelar',
                handler: () => {
                  this.valor = 0;
                }
              }, {
                cssClass: 'primarybtn', 
                text: 'Salir',
                handler: async () => {
                  this.valor = 0;
                  App.exitApp();
                }
              }
            ]
          });

          await alert.present();

        } else if (this.router.isActive('/principal/ruta', true) && this.router.url === '/principal/ruta') {
         App.minimizeApp();
        } else if (this.router.isActive('/principal/pedido', true) && this.router.url === '/principal/pedido') {
         App.minimizeApp();
        } 

      });
      //fin backbutton
    });
  }
}

