import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Evaluacion } from '../../models/pregunta.model';
import { PacienteModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
//import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styles: [
  ]
})
export class PacientesComponent {
  pacientes:PacienteModel[]=[];
  evaluaciones:Evaluacion[]=[];
  select_P:number=-1;
  listarEvaluaciones:boolean=false;
  constructor(public _cargaImagenes:CargaImagenesService,
    private auth:AuthService,
    private router:Router ) {
      
     }

     crearPaciente(){
      this.router.navigate(['paciente']);
     }
  //////////////////////////////////////////////////////////////////////////////////////   
  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    await this._cargaImagenes.leerPacientes(this.auth.actualUser.email).then(res=>{
      if(!res)
        console.error('Error en Lectura de Pacientes');
    });
    this._cargaImagenes.pacientesAsObservable().subscribe(data=>{
      this.pacientes=data;
    });
    /*await this._cargaImagenes.leerEvaluacionesPaciente(this.auth.actualUser.email,'001',true)
                  .finally(()=>{
                    console.log('finaliza lectura de evaluaciones');
                  });//*/

  }
  ////////////////////////////////////////////////////////////////////
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    
  }
  deletePaciente(pos:number){
    //this._cargaImagenes.pacientes.splice(pos,1);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-outline-primary",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
    let nombre_Paciente_x=this.pacientes[pos].nombre;
    //let idPaciente_x=this.pacientes[pos].idPaciente;
    swalWithBootstrapButtons.fire({
      title: "¿Está seguro de eliminar el siguiente Paciente?",
      text: "Nombre: "+nombre_Paciente_x ,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar! ",
      padding: "3em",
      buttonsStyling:true,
      
      cancelButtonText: "Cancelar",
      //reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this._cargaImagenes.eliminarPaciente(this.pacientes[pos].idPaciente);
        swalWithBootstrapButtons.fire({
          title: "Usuario Eliminado",
          text: "Se ha eliminado el Paciente: "+ nombre_Paciente_x,//+"\ncon Id:"+idPaciente_x,
          icon: "info"
        });
        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel || result.isDenied
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "Cancelada eliminación de Paciente: "+nombre_Paciente_x,
          icon: "info"
        });
      }
    });


  }
  async listar(pos:number){
    
    this.select_P=pos;                 
    await this._cargaImagenes.leerEvaluacionesPaciente(this.auth.actualUser.email,this.pacientes[pos].idPaciente,false)
                  .then(data=>{
                      console.log('pacientes.component->data:',data);
                      this.evaluaciones=data;
                  })
                  .finally(()=>{
                    console.log('finaliza lectura de evaluaciones');
                  });
    
    this.listarEvaluaciones=true;
  }
  evaluar(pos:number){
    console.log('pacientesComponent->evaluar->ruta:',['evaluar',this.pacientes[this.select_P].idPaciente,this.evaluaciones[pos].fecha_ini.getTime()]);
    this.router.navigate(['evaluar',this.pacientes[this.select_P].idPaciente,this.evaluaciones[pos].fecha_ini.getTime()]);
    
  }
  evaluarNew_direct(pos:number){
    this.router.navigate(['evaluar',this.pacientes[pos].idPaciente,'0']);
  }
  evaluarNew(){
    this.router.navigate(['evaluar',this.pacientes[this.select_P].idPaciente,'0']);
    
  }

}
