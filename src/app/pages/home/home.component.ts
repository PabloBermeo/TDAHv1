import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mostrarStd=false;
  correo:string;
  verTodos:boolean;
  constructor(private _auth:AuthService,
              private _cargarServicio:CargaImagenesService,
              private router:Router) { 
                //_cargarServicio.leerEvaluaciones(auth.leerEmail());
                this.correo=this._auth.leerEmail();
                //this.verTodos=this.auth.esDocente();
                if(this.nivelUsuario()===1){
                  this.router.navigate(['evaluar',this.correo,0]);
                }
                this.verTodos=this._auth.nivelUsuario()>1;

              }
public nivelUsuario(){
  return this._auth.nivelUsuario();
}

public autoevaluacion(){
  this.router.navigate(['evaluar',this.correo.toUpperCase(),0]);
}
  async ngOnInit() {
    
    this.mostrarStd=false;
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Cargando Preguntas',
      text: 'Espere por favor...'
      
    })
    Swal.showLoading();
    //await this._cargarServicio.actualizarUrlsImagenes();
    await this._cargarServicio.leerPreguntas();
    //await this._cargarServicio.leerPacientes(this.auth.actualUser.email);
    Swal.close();
    this.mostrarStd=true;
    console.log('VerTodos:',this.verTodos,'MostrarStd:',this.mostrarStd,'correo:',this.correo);
  }

  /*salir(){
      this.auth.logout();
      this.router.navigateByUrl('/login');
  }*/
  /*verEstadisticas(tipo:number){
    
    this.mostrarStd=true;
  }*/
}
