import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styles: [
  ]
})

export class PacienteComponent {
  public paciente:PacienteModel={
    idPaciente:"",
    nombre:"",
    sexo:"",
    fecha_creacion:null,
    n_evaluaciones:0
  };
  constructor(private _carga:CargaImagenesService,
              private router:Router,
              private _auth:AuthService){
    this.paciente.idPaciente=this.makeId(10);
    /*this._carga.leerPacientes(this._auth.actualUser.email).then(resp=>{
      console.log('paciente.component->constructor->resp:',resp);
    });*/
  }

 async  onSubmit(f1:NgForm){
    if(f1.invalid){return;}
    if(this.paciente.edad=== undefined || this.paciente.sexo.length===0){return;}
    await this._carga.crearPaciente(this.paciente).catch(err=>{
      console.log('ERROR en creación de paciente:',err);
    }).finally(()=>{

      console.log('Finaliza creación de paciente');
      this.router.navigateByUrl('/pacientes');
    })

  }
  cancel(){
    this.router.navigateByUrl('/pacientes');
  }
  makeId(length:number){
    var result="";
    var characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength=characters.length;
    for(var i=0;i<length;i++){
        result += characters.charAt(Math.floor(Math.random() *charactersLength));
    }
    return result;
  }
}
