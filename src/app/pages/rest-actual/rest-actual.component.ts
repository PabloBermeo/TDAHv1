import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service' ;
import { CargaImagenesService } from '../../services/carga-imagenes.service';

@Component({
  selector: 'app-rest-actual',
  templateUrl: './rest-actual.component.html',
  styles: []
})
export class RestActualComponent implements OnInit {
  verCalificacion:false;
  correo:string;
  constructor(private router:Router,
              private _carga:CargaImagenesService,
              private _auth:AuthService) { }

  ngOnInit() {
    this.verCalificacion=false;
    this.correo=this._auth.leerEmail();
    this.verCalificacion=false;
    console.log('Correo:',this.correo);
  }
  irHome(){
    this.router.navigate(['/home']);
  }
}
