import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {
  public IdPedido = null;
  public latitud:any = null;
  public longitud:any = null;
  public empresas:any = [];
  constructor() { }

  getIdPedido(){
    return this.IdPedido;
  }

  setIdPedido(IdPedido: any){
    this.IdPedido = IdPedido;
  }

  setCoordsMoto(latitud:number,longitud:number){
    this.latitud = latitud;
    this.longitud = longitud;
  }

  getCoordsMoto(){
    return {latitud:this.latitud,longitud:this.longitud}
  }
}
