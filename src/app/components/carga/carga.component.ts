import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//import {AngularFirestore} from 'angularfire2/firestore';//'@angular/fire/firestore';
//import * as firebase from 'firebase';
import { FileItem } from '../../models/file-items';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';



@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styles: []
}) 



export class CargaComponent implements OnInit {
  @Input() cargarUsuarios=false;
 // _PATH='C:/Users/UPS/Dropbox/UPS/Vinculación_Telecomunicaciones/Proyectos/2020/PV_07_LaSalle/Banco de Preguntas/';
 // _FILENAME='hola.txt';
 
  data:string[];
  archivos: FileItem[]=[];
  archivosP: FileItem[]=[];
  estaSobreElemento=false;

  constructor(public _cargaImagenes:CargaImagenesService,
              private _auth:AuthService,
              private router:Router) {
    if(this._auth.nivelUsuario()<2){
      this.router.navigateByUrl('/home');
    }
   }


  ngOnInit() {
  }

   cargarImagenes(){
    //console.log('archivos:',this.archivos);
    //return
    if(this.archivos.length>0){
 
      this._cargaImagenes.cargarImagenesFirebase(this.archivos);
    }
    
  }

  async crearUsuarios(){
    if(this.archivosP.length>0){
      console.log('this.archivosP:',this.archivosP);
      await this._cargaImagenes.crearUsuariosFirebase(this.archivosP);
    }
  }
  
  async cargar(){
    //Crear archivo del array "archivoP"
    await this.crearUsuarios();
   //await this._cargaImagenes.actualizarUrlsImagenes();//
  }
  // private guardarImagen(imagen: any){
  //   this.db.collection(`/${this.CARPETA_IMAGENES}`).add(imagen);
  // }
  
  limpiarArchivos(){
    
    this.archivos=[];
    this.archivosP=[];
    
  }
}
