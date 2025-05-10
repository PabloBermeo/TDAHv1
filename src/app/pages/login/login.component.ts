import { Component, inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

//import Swal from 'sweetalert2';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
//import Swal from 'sweetalert2/dist/sweetalert2.js';


@Component({
  selector: 'app-login',
 // standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent implements OnInit {
  fieldTextType=false;
  recordarme=false;
  router=inject(Router);

  usuario: UsuarioModel= new UsuarioModel();
  constructor(private auth:AuthService) { }
  mostrarOcultarPwd(){
    this.fieldTextType=!this.fieldTextType;
  }
  ngOnInit() {
    if(localStorage.getItem('email')){
      this.usuario.email=localStorage.getItem('email');
      this.recordarme=true;

    }else{
      this.usuario.email='';
      this.usuario.nombre='';
      this.usuario.password='';
    }

  }

  login(form:NgForm ){
    if(form.invalid){return;}
    // console.log(this.usuario);
    // console.log(form);
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Ingresando',
      text: 'Espere por favor...'
      
    })
    Swal.showLoading();
    this.auth.login(this.usuario)
          .subscribe({next:resp=>{
            //console.log(resp);
            Swal.close();
            if(this.recordarme){
              localStorage.setItem('email',this.usuario.email.toUpperCase() );
            }else {
              if(localStorage.getItem('email')){
                  localStorage.removeItem('email');
              }
              this.usuario.email='';
              this.usuario.nombre='';
              this.usuario.password='';
            }
            this.router.navigateByUrl('/pacientes');
          },error:err=>{
            //console.log(err.error.error.message);
            Swal.close();
            Swal.fire({
              allowOutsideClick: false,
              icon: 'error',
              title: 'Error al autenticar',
              text: err.error.error.message
              
            })
          }});



  }
}
