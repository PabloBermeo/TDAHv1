import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
@Component({
  selector: 'app-del-one-user',
  templateUrl: './del-one-user.component.html',
  styles: [
  ]
})
export class DelOneUserComponent {
  usuario={
    nombre:'',
    email:'',
    password:'',
  };
  idToken_a_borrar='';
  constructor(private _auth:AuthService){}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.usuario=new UsuarioModel();
  }
  lecturaTokenServidor(){
    this._auth.lecturaTokenServidor(this.usuario).subscribe(resp=>{
      this.idToken_a_borrar=resp;
    });
  }
  onSubmit(form:NgForm){
    if(form.invalid || this.idToken_a_borrar.length===0){return;}

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Eliminando Usuario',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    console.log('en delOneUser, this.usuario:',this.usuario);
    
    
    this._auth.delUsuario(this.usuario,this.idToken_a_borrar)//si es true se registra con el usuario creado
      .subscribe({next:resp=>{
        //console.log(resp);
        Swal.close();

        Swal.fire({
          allowOutsideClick: false,
          icon: 'info',
          title: 'Usuario eliminado: ',
          text: 'Usuario '+this.usuario.email+' eliminado Exitosamente'
          
        })
        console.log('eliminación ok, resp:',resp);
        this.usuario.email='';
        this.usuario.password='';
        this.idToken_a_borrar='';
       // window.location.reload();
        
          
        //this.router.navigateByUrl('/home');
      },error: err=>{
        console.log('Error en delete de Usuario',err);
        //console.log(err.error.error.message);

        
        /*Swal.fire({
          allowOutsideClick: false,
          icon: 'error',
          title: 'Error al eliminar usuario',
          text: err.error.error.message
          
        })*/
      }
    });
  }
}
