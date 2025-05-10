import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
//import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone:false,
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent implements OnInit {
 // esDocente:boolean=false;
 // esSuperUsuario:boolean=false;
  nivelUsuario=0;
  correo:string='';
  constructor(private _auth:AuthService,
              private router:Router,
              private _carga:CargaImagenesService) { 
    //this.esDocente=false;
    //this.esSuperUsuario=false;
    this.correo=this._auth.leerEmail();
    this.nivelUsuario=this._auth.nivelUsuario();
  }

  ngOnInit() {
    //this.esDocente=this._auth.esDocente();
    //this.esSuperUsuario=this._auth.esSuperUsuario();
    this.nivelUsuario=this._auth.nivelUsuario();
  }
  salir(){
    console.log('Saliendo del programa...');
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-outline-primary",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: true
    });
    swalWithBootstrapButtons.fire({
      title: "¿Está seguro de salir del programa?",
      text: "Seleccione Si para continuar",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, salir! ",
      cancelButtonText: "Cancelar",
      //reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire({
          title: "Adios!",
          text: "Hasta la próxima.",
          icon: "info"
        });
        this._auth.logout();
        this._carga.limpiaPacientes_Evaluaciones();
        this.router.navigateByUrl('/login');
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "Seguimos trabajando",
          icon: "success"
        });
      }
    });



  }

}
