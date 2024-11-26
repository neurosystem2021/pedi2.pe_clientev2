import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  //private servidor = "http://192.168.0.10:5000/";
  private servidor = environment.dataUrl;
  constructor() { }

  //Loggin
  getLogginMotorizado(Dni:string, Password:string){
    let config = {
      params:{
        Dni:Dni,
        Password:Password
      }
    };
    const path = this.servidor + "/api/login/motorizado";
    return axios.get(path, config);
  }

  //Obtener las empresas para las que trabaja un motorizado activamente
  getEmpresasActivas(IdMotorizado:number){
    let config = {
      params:{
        IdMotorizado:IdMotorizado
      }
    };
    const path = this.servidor + "/api/empresas/motorizado";
    return axios.get(path, config);
  }

  //Obtener pedido activo para el motorizado
  getPedidosSolicitud(IdMotorizado: number){
    let config = {
      params:{
        IdMotorizado:IdMotorizado
      }
    };
    const path = this.servidor + "/api/pedidos/motorizado/solicitud";
    return axios.get(path, config);
  }

  //Obtener los detalles del pedido activo actualmente
  getPedidoActivoDetalles(IdPedido: number){
    let config = {
      params:{
        IdPedido:IdPedido
      }
    };
    const path = this.servidor + "/api/pedidos/motorizado/solicitud/detalle";
    return axios.get(path, config);
  }

  getEstadoPedidoActivo(idPedido:number){
    let config={
      params:{
        IdPedido: idPedido,
      }
    }
    const path = this.servidor + "/api/pedidos/activo/estado";
    return axios.get(path, config);
  }
  
  //Verificar existencia de pedido activo
  getPedidoActivoId(IdMotorizado:number){
    let config = {
      params:{
        IdMotorizado:IdMotorizado
      }
    };
    const path = this.servidor + "/api/pedidos/motorizado/activo/id";
    return axios.get(path, config);
  }

  getPedidoActivoDetalle(IdMotorizado:number){
    let config = {
      params:{
        IdMotorizado:IdMotorizado
      }
    };
    const path = this.servidor + "/api/pedidos/motorizado/activo/detalle";
    return axios.get(path, config);
  }

  //Actualizar estado del pedido
  postActualizarEstadoPedido(IdPedido:number, Estado: string){
    const path = this.servidor + "/api/pedidos/motorizado/cambiar/estado";
    return axios.post(path, {Estado:Estado,IdPedido:IdPedido});
  }

  //Obtener chat
  getMensajes(IdPedido:number){
    let config = {
      params:{
        IdPedido:IdPedido
      }
    };
    const path = this.servidor + "/api/pedidos/chat";
    return axios.get(path, config);
  }

  //Enviar nuevo mensaje al servidor
  postNuevoMensajeServidor(IdPedido:number, Chat: string){
    const path = this.servidor + "/api/pedidos/chat/actualizar";
    return axios.post(path,{IdPedido:IdPedido, Chat:Chat, Tipo:'CLIENTE'});
  }

  //Estados a cambiar
  //Accion aceptar-rechazar pedido
  postEstadoCamino(IdPedido:number,IdMotorizado:number){
    const path = this.servidor + "/api/pedidos/motorizado/cambiar/camino";
    return axios.post(path, {IdPedido:IdPedido,IdMotorizado:IdMotorizado});
  }

  postEstadoUbicacion(IdPedido:number,IdMotorizado:number){
    const path = this.servidor + "/api/pedidos/motorizado/cambiar/ubicacion";
    return axios.post(path, {IdPedido:IdPedido,IdMotorizado:IdMotorizado});
  }

  postEstadoFinalizado(IdPedido:number,IdMotorizado:number){
    const path = this.servidor + "/api/pedidos/motorizado/cambiar/finalizar";
    return axios.post(path, {IdPedido:IdPedido,IdMotorizado:IdMotorizado});
  }

  getMotorizadoGrupo(IdMotorizado: number){
    let config = {
      params:{
        IdMotorizado:IdMotorizado
      }
    };
    const path = this.servidor + "/api/empresas/motorizado/grupo";
    return axios.get(path, config);
  }

}