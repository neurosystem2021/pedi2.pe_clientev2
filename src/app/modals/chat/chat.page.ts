import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { IonInput, ModalController, IonContent, ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { AccionesService } from 'src/app/services/acciones.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild("content",{ static: false }) content!: IonContent;
  @Input() public nombreCliente!:string;
  @Input() public IdCliente!:number;
  @Input() public IdPedido!:number;
  @Input() public mensajes!:any[];
  @Input() public telefonoCliente:any;
  @ViewChildren('allTheseThings') things!: QueryList<any>;
  @ViewChild('inputid', { static: false }) myInput!: IonInput;
  IdMotorizado: any;

  escucharNuevoMensaje!: Subscription;
  
  nuevaEntrada: string = "";
  subcribescroll!: Subscription;
  //Botones
  botonEnviar: boolean = false;
  constructor(
    public modalController:ModalController,
    public storage: Storage,
    public dataService: DataService,
    public accionesService: AccionesService,
    public toastController: ToastController,
    private callNumber: CallNumber,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    //Subscrition para refrescar el chat cada vez que el cliente envie un nuevo mensaje
    this.escucharNuevoMensaje = this.accionesService.mensajeEscuchar().subscribe(resp =>{
      this.refrescarMensajesCliente();
    });
  }

  //Ejecutar acciones mientras la vista se carga
  async ionViewWillEnter(){
    //Bajar el scroll hasta el final antes de que termine de cargar la vista
    this.scrollToBottom();
    this.subcribescroll= this.things.changes.subscribe(t => {
      this.scrollToBottom();
    });
    //Obtener los datos del motorizado del localStorage
    let datosMotorizado = await this.storage.get('localDataMotorizado');
    this.IdMotorizado = datosMotorizado.IdMotorizado;
    //Obtener el id del pedido activo del localStorage
    //this.IdPedido = await this.storage.get('idPedidoActivo');
    //Conectarse al servidor y obtener el chat del pedido activo
    this.refrescarMensajesCliente();
  }

  async llamarCliente(){
    const alert = await this.alertController.create({
      header: 'Llamada al cliente',
      message: "¿Desea llamar al cliente?"+this.telefonoCliente,
      cssClass: 'alertacarrito',
      mode: "ios",
      buttons: [
        {
          text: 'No',
          cssClass: 'secondarybtn',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'primarybtn',
          handler: () => {
            this.callNumber.callNumber(this.telefonoCliente, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
          }
        }
      ]
    });
  
    await alert.present();

  }

  //Foco al input después 150ms después de cargar la vista 
  ionViewDidEnter(){
    setTimeout(() => {
      this.myInput.setFocus();
    },150);
  }

  //Función asincrónica para enviar mensajes nuevos al servidor
  async enviarMensaje(){
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp("'", 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('"', 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('\n', 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('\\'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '')
    //this.nuevaEntrada = (''+this.nuevaEntrada).replace("''",'');
    //this.nuevaEntrada = (''+this.nuevaEntrada).replace("\n",'');
    if(this.nuevaEntrada.trim().length===0){
      return;
    }else{
      this.botonEnviar = true;
    }
    this.myInput.setFocus();
    //Refrescar mensajes
    this.refrescarNuevosMensajes();
    this.scrollToBottom();
  }

  //Refrescar mensajes cuando un cliente envia un mensaje
  async refrescarMensajesCliente(){
    try {
      let data = await this.dataService.getMensajes(this.IdPedido);
      if(data.data.success){
        this.mensajes = data.data.chat!=null && data.data.chat!= ""  ? JSON.parse(data.data.chat) : [];
      }else{
        const toast = await this.createToaster(2000,data.data.msg,'danger');
        toast.present();
      }
    } catch (error: any) {
      const toast = await this.createToaster(2000,error,'danger');
      toast.present();
    }    
  }
  //Función para enviar y obtener los nuevos mensajes
  async refrescarNuevosMensajes(){
    try {
      let resp = await this.dataService.postNuevoMensajeServidor(this.IdPedido,JSON.stringify({user:this.IdMotorizado,msg:this.nuevaEntrada,motorizado:true}));
      this.botonEnviar = false;
      if(resp.data.success){
        this.mensajes = resp.data.chat!=null && resp.data.chat!= ""  ? JSON.parse(resp.data.chat) : [];
        this.accionesService.mensajeEmitir(this.IdCliente,this.IdPedido,this.nuevaEntrada);//IDCliente, IDPedido
        this.nuevaEntrada = "";
      }else{
        const toast = await this.createToaster(3000,'No se pudo enviar el mensaje, compruebe su conexión a internet.','danger'); 
        toast.present();
      }
    } catch (error: any) {
      this.botonEnviar = false;
      const toast = await this.createToaster(3000,error,'danger'); 
      toast.present();
    }
  }

  //Cerrar el modal sin realizar ningún cambio
  dismiss(){
    this.modalController.dismiss(null);
    this.escucharNuevoMensaje.unsubscribe();
  }

  //Bajar el scroll hasta el final
  scrollToBottom() {
    setTimeout(()=>{
      this.content.scrollToBottom(50);
    },50);
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

  //Destroy
  ionViewDidLeave(){
    //Dejar de bajar el scroll cuando se abandone la vista
    this.subcribescroll.unsubscribe();
  }
}