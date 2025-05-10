import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';
import {map} from 'rxjs/operators';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
import { environment } from '../../environments/environment';
//import { nextTick } from 'process';
//import { SelectMultipleControlValueAccessor } from '@angular/forms';
const API_KEY=environment.firebase.apiKey;
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //https://firebase.google.com/docs/reference/rest/auth <-ver información para 
  private url='https://identitytoolkit.googleapis.com/v1/accounts:';
  private apikey=API_KEY;
  private listaSuperUsuario=['superuserCIMA@ups.edu.ec','lguerrero@ups.edu.ec','jjaras@ups.edu.ec'];
  private listaDesarrollador=['JPBermeo@hotmail.com','jbermeo@ups.edu.ec'];//'ESTUDIANTEPRUEBA@EST.UPS.EDU.EC'
  
  userToken:string;
  actualUser:UsuarioModel={email:'',nombre:'',password:''};

   constructor(private http:HttpClient) { 
    
    this.leerToken();
    this.listaSuperUsuario.forEach((value,index)=>{this.listaSuperUsuario[index]=value.toUpperCase();});
    this.listaDesarrollador.forEach((user,index)=>{this.listaDesarrollador[index]=user.toUpperCase();});
  //  console.log('asdfas--nivelUsuario->listaSuperUsuario:',this.listaSuperUsuario);
  //  console.log('asdfas--nivelUsuario->listaDesarrollador:',this.listaDesarrollador);
  }

  login(usuario:UsuarioModel){
    const authData={
      email: usuario.email.toUpperCase(),
      password: usuario.password,
      returnSecureToken: true
    }
    //console.log('login()-usuario',usuario.email);
    this.actualUser.email=usuario.email;//almacena los datos del usuario registrado.
    this.actualUser.nombre=usuario.nombre;//almacena los datos del usuario registrado.
   // console.log('login()-usuario',this.actualUser.email);
    return this.http.post(`${this.url}signInWithPassword?key=${this.apikey}`,
            authData).pipe(
              map(resp=>{ //Si existe un error, no se activa
                //console.log('Ingresó un usuario regisrado');
               
                this.guardarToken(resp['idToken']);
                return resp;
              })
            );

  }
  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('expira');
    //localStorage.removeItem('email0');
    this.userToken='';
    
  }

   nuevosUsuarios(usuariosAll:UsuarioModel[]){
    let usuariosError:string='';
    
    for(let usuario1 of usuariosAll){
          /*Swal.fire({
            allowOutsideClick: false,
            icon: 'info',
            title: `Ingresando ${usuario1.nombre}`,
            text: 'Espere por favor...'
            
          })
          Swal.showLoading();*/
          //console.log('USUARIO:',usuario1);
          //continue;
          this.nuevoUsuario(usuario1,false)
                .subscribe({next: resp=>{
                    console.log('En auth->nuevosUsuarios->resp:',resp);
                    Swal.close();
                },
                error:err=>{
                  //console.log('Error en registro de Usuario:'+usuario1.email,err.error.error.message);
                 //usuariosError.push(i.toString()+' '+usuario1.email+'\n');
                 usuariosError=usuariosError+usuario1.email+'; ';
                // Swal.close();
                if(usuariosError.length>0 ){
                  console.log('USUARIOS CON PROBLEMAS:',usuariosError);
                  Swal.fire({
                    allowOutsideClick: false,
                    icon: 'error',
                    title: 'Error al registrar Usuarios:\n',
                    text: usuariosError
                  });
                  //Swal.showLoading();
                }
                // Swal.fire({
                //     allowOutsideClick: false,
                //     icon: 'error',
                //     title: 'Error al registrar Nuevo Usuario:\n'+usuario1.email,
                //     text: err.error.error.message
                // });
              },complete:()=>{
                console.log('USUARIO FINALES CON PROBLEMAS:',usuariosError);
                if(usuariosError.length>0 ){
                  Swal.fire({
                    allowOutsideClick: false,
                    icon: 'error',
                    title: 'Error al registrar Usuarios:\n',
                    text: usuariosError
                  });
                }
              }});//*/
          this.sleep(100);  
     
    }


  }
  sleep(milliseconds:number) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  nuevoUsuario(usuario:UsuarioModel,actual_email:boolean){
    try {
      
      const authData={
        email: usuario.email.toUpperCase().trim(),
        password: usuario.password.toString().trim(),
        returnSecureToken: true
      }
      if(actual_email){
        this.actualUser.email=usuario.email;//almacena los datos del usuario registrado.
        this.actualUser.nombre=usuario.nombre;//almacena los datos del usuario registrado.
      }
      //console.log('Antes_de_post-nuevoUsuario:',authData);
      
      return this.http.post(`${this.url}signUp?key=${this.apikey}`,
      authData).pipe(
        map(resp=>{ //Si existe un error, no se activa
          //console.log('Ingresó un nuevo Usuario');
          this.guardarToken(resp['idToken']);
          return resp;
        })
        );
      } catch (error) {
        console.log('ERROR en nuevoUsuario:',error);
        return null;
      }
    }
  lecturaTokenServidor(usuario:UsuarioModel) {
    const authData={
      email: usuario.email.toUpperCase(),
      password: usuario.password,
      returnSecureToken: true
    }
    let idTokenServidor='---xx---'
    return this.http.post(`${this.url}signInWithPassword?key=${this.apikey}`,
      authData).pipe(
          map(resp=>{ //Si existe un error, no se activa
            
            idTokenServidor=resp['idToken'];
            return idTokenServidor;
            //
          })
        )
  } 
  //delUsuario para borrar usuario  
  delUsuario(usuario:UsuarioModel,idToken_del:any){
    //let idToken_del='--x--';
    try {
        /*this.lecturaTokenServidor(usuario).subscribe(resp=>{
          idToken_del=resp;
          console.log('en delUsuario, eliminando usuario delUsuario, idToken_del',idToken_del);
        });*/
        
        return this.http.post(`${this.url}delete?key=${this.apikey}`,
                 {idToken:idToken_del}).pipe(
                   map(resp=>{ //Si existe un error, no se activa
                               //console.log('Ingresó un nuevo Usuario');
                               this.guardarToken(resp['idToken']);
                               return resp;
                             })
                   );
          
      } catch (error) {
        console.log('ERROR en delUsuario:',error);
        return null;
      } finally{
        console.log('en FINALLY, eliminando usuario delUsuario, idToken_del',idToken_del);
        
      }
  }
////////////////////////////////////////////////////////////////////////////
//Aqui se guarda el Token y se configura el tiempo de expiración
  private guardarToken(idToken:string){
    let hoy=new Date();

    hoy.setSeconds(8*3600);
    localStorage.setItem('expira',hoy.getTime().toString());
    this.userToken=idToken;
    localStorage.setItem('token',idToken);
    //console.log('guardarToken()-usuario',this.actualUser.email);
    localStorage.setItem('email0',this.actualUser.email.toString().toUpperCase());
    
  }
  public leerEmail():string{
    if(localStorage.getItem('email0')){
      return localStorage.getItem('email0');
    }else{
      return '';
    }
  }
  private leerToken(){
    if(localStorage.getItem('token')){
      this.userToken=localStorage.getItem('token');
    }else{
      this.userToken='';
    }
    if(localStorage.getItem('email0')){
      this.actualUser.email=localStorage.getItem('email0');
    }else{
      this.actualUser.email='';
    }
    
    return this.userToken;
  }
  estaAutenticado():boolean{
    if(this.userToken===undefined || this.userToken.length<2){
      return false;
    }
    const expira=Number(localStorage.getItem('expira'));
    const expiraDate=new Date();
    expiraDate.setTime(expira);//la fecha de validación

    if(new Date()< expiraDate ){
      return true;
    }else{
      return false;
    }

    
  }
  //retorna el nivel de usuario siendo 
  //1: Usuario básico
  //2: SuperUsuario
  //3: Desarrollador
  nivelUsuario():number{
    let nivel=1;
    let correo:string=this.actualUser.email;
    
    if(this.listaSuperUsuario.includes(correo.toUpperCase())){
      nivel=2;
    }
    if(this.listaDesarrollador.includes(correo.toUpperCase())){
      nivel=3;
    }
    return nivel;
  }
}

