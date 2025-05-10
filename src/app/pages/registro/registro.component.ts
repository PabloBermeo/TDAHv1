import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
//import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

 usuario:UsuarioModel;
 recordarme=false;

  constructor(private auth:AuthService,
              private router:Router) { }

  ngOnInit() { 
    
    this.usuario=new UsuarioModel();

    if(localStorage.getItem('email') && this.recordarme){
      this.usuario.email=localStorage.getItem('email');
      this.recordarme=true;
    }else{
      //console.log('no existe email');
      this.usuario.email='';
      this.usuario.nombre='';
      this.usuario.password='';
    }
    //this.router.navigateByUrl('/pacientes');
  }

  onSubmit(form:NgForm){
    if(form.invalid){return;}

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Creando Usuario',
      text: 'Espere por favor...'
      
    })
    Swal.showLoading();

    this.auth.nuevoUsuario(this.usuario,false)//si es true se registra con el usuario creado
      .subscribe({next:resp=>{
        //console.log(resp);
        Swal.close();
        /*if(this.recordarme){
          localStorage.setItem('email',this.usuario.email );
        }else {
          if(localStorage.getItem('email')){
              localStorage.removeItem('email');
          }
          this.usuario.email='';
          this.usuario.nombre='';
          this.usuario.password='';
        }*/
        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          title: 'Usuario Creado Exitosamente',
          text: this.usuario.email
          
        })
        window.location.reload();
        this.usuario.email='';
        this.usuario.nombre='';
        this.usuario.password='';
          
        //this.router.navigateByUrl('/home');
      },error: err=>{
        console.log('Error en registro de Usuario',err);
        //console.log(err.error.error.message);

        
        Swal.fire({
          allowOutsideClick: false,
          icon: 'error',
          title: 'Error al registrar Nuevo Usuario',
          text: err.error.error.message
          
        })
      }
    });

  }

}
