import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';


@Injectable({
  providedIn: 'root'
})
export class AccionesService {

  constructor(
    public webSocketService: WebsocketService
  ) { }

  enviarDatos(user:string, password:string){
  }

  //Escuchar nuevo viaje asignado al motorizado
  nuevoViaje(){
    return this.webSocketService.listen('nuevo-viaje-recibido');
  }

  //Escuchar nuevo mensaje recibido del cliente
  mensajeEscuchar(){
    return this.webSocketService.listen('mensaje-recibido');
  }

  //Emitir nuevo mensaje para el cliente
  mensajeEmitir(IdCliente:number,IdPedido:number,msg:string){
    const payload = {
      iddb:IdCliente,
      idPedido: IdPedido,
      tipo: 'CLIENTE',
      msg:msg
    }
    console.log(payload);
    return this.webSocketService.emit('mensaje-emitir',payload);
  }

  //Emitir actualizacion de estado
  estadoActualizar(IdCliente:number, IdPedido:number,estado:string, plataforma:string, idalmacen:number,idregion:number){
    const payload = {
      iddb:IdCliente,
      idpedido: IdPedido,
      tipo: 'CLIENTE',
      estado: estado,
      plataforma: plataforma,
      idalmacen: idalmacen,
      idregion:idregion
    }
    return this.webSocketService.emit('estado-pedido-actualizar',payload);
  }

  //Emitir aceptación de pedido asignado
  aceptarPedidoNuevo(){
    return this.webSocketService.emit('aceptar-pedido-nuevo');
  }

  //Emitir rechazo de pedido asignado
  rechazarPedidoNuevo(){
    return this.webSocketService.emit('rechazar-pedido-nuevo');
  }

  //Emitir coordenadas actuales del driver
  emitirUbicacion(IdMotorizado:number,IdCliente:number,IdPedido:number,LatDriver:any, LngDriver: any){
    const payload = {
      idmotorizado:IdMotorizado,
      idcliente:IdCliente,
      idpedido: IdPedido,
      latitud: LatDriver,
      longitud: LngDriver,
      tipo: 'CLIENTE'
    }
    return this.webSocketService.emit('ubicacion-motorizado-actualizar',payload);
  }

  //Escuchar estado cambiados desde la web de administración
  escucharEstadoPedido(){
    return this.webSocketService.listen('estado-pedido-recibir');
  }

  //Escuchar estado pedido
  escucharEstadaPedidoPlataforma(){
    return this.webSocketService.listen('estado-pedido-actualizado');
  }

  emitirCoordenadasMotorizado(IdMotorizado:string, Lat:number, Lon:number, Empresas:any, IdRegion:number){
    const payload = {
      IdMotorizado: IdMotorizado,
      Lat: Lat,
      Lon: Lon,
      Empresas: Empresas,
      IdRegion:IdRegion
    }
    return this.webSocketService.emit('coordenadas-motorizado',payload);
  }
}
