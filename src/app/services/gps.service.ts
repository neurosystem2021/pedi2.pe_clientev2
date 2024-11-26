import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

import { delay } from 'rxjs/operators';
import { AccionesService } from './acciones.service';
import { Storage } from '@ionic/storage';
import { DataService } from './data.service';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class GpsService {
  NombreUsuario: any;
  escucharCoords: any = null;
  tiempoespera: any = null;
  latituteActualDriver: any = null;
  longitudeActualDriver: any = null;
  IdMotorizado: any = null;
  Empresas: any = [];
  IdRegion: number = 0;
  constructor(
    public alertController: AlertController,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    public accionesService: AccionesService,
    private storage: Storage,
    public dataService: DataService
  ) {}

  //Permisos
  checkGPSPermission() {
    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
      )
      .then(
        (result) => {
          if (result.hasPermission) {
            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS();
          } else {
            //If not having permission ask for permission
            this.requestGPSPermission();
          }
        },
        (err) => {
          // alert(err);
        }
      )
      .catch((error) => {
        this.verificacionGPS();
      });
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions
          .requestPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            (error) => {
              this.verificacionGPS();
              //Show alert if user click on 'No Thanks'
              //alert('requestPermission Error requesting location permissions ' + error)
            }
          )
          .catch((error) => {
            this.verificacionGPS();
          });
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy
      .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(
        async () => {
          if (this.tiempoespera != null) {
            clearInterval(this.tiempoespera);
          }

          //Escuchar coordenadas
          const coords = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
          });
          this.latituteActualDriver = coords.coords.latitude;
          this.longitudeActualDriver = coords.coords.longitude;
          this.tiempoespera = setInterval(() => {
            if (
              this.latituteActualDriver != null &&
              this.longitudeActualDriver != null
            ) {
              this.accionesService.emitirCoordenadasMotorizado(
                this.IdMotorizado,
                this.latituteActualDriver,
                this.longitudeActualDriver,
                this.Empresas,
                this.IdRegion
              );
            }
          }, 3000);
        },

        (error) => {
          this.verificacionGPS();
        }
      )
      .catch((error) => {
        this.verificacionGPS();
      });
  }

  async verificacionGPS() {
    const alert = await this.alertController.create({
      header: '¡Requerido!',
      message: 'La Aplicacion nesecita usar GPS, porfavor activelo!',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [
        {
          cssClass: 'primarybtn',
          text: 'Activar',
          handler: async () => {
            this.checkGPSPermission();
          },
        },
      ],
    });

    await alert.present();
  }

  async getInfoMotorizado() {
    let motorizado = await this.storage.get('localDataMotorizado');
    if (motorizado != null || motorizado != undefined) {
      this.IdMotorizado = motorizado.IdMotorizado;
      try {
        let respuestaEmpresas = await this.dataService.getEmpresasActivas(
          this.IdMotorizado
        );
        if (respuestaEmpresas.data.success == true) {
          this.Empresas = respuestaEmpresas.data.data.map(
            ({ FacturaUrl, IdAlmacen }: any) => ({ FacturaUrl, IdAlmacen })
          );
          this.IdRegion = respuestaEmpresas.data.info.IdRegion;
          this.checkGPSPermission();
        }
      } catch (error) {
        console.log(error);
        const alert = await this.alertController.create({
          header: '¡Sin conexión!',
          backdropDismiss: false,
          message:
            'No se pudo obtener su usuario por favor conectese a internet y renicie la aplicación.',
          mode: 'ios',
          buttons: [
            {
              cssClass: 'primarybtn',
              text: 'Salir',
              handler: () => {
                App.exitApp();
              },
            },
          ],
        });
        await alert.present();
      }
    }
  }

  getCoordenadasMotorizado() {
    return {
      latitud: this.latituteActualDriver,
      longitud: this.longitudeActualDriver,
    };
  }

  stopSubcriptions() {
    if (this.tiempoespera != null) {
      clearInterval(this.tiempoespera);
    }
  }
}
