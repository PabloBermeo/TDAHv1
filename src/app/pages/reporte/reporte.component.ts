import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
//import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
  correoIndividual:string='';
  email_consulta:string='';
  mostrarStd:boolean=false;
  n_pos:number[]=[];
  listar:boolean[]=[];
  pacientes:PacienteModel[]=[];
  //pacientesLocal:PacienteModel[]=[];
  nivelUsuario=0;

  actualizarListar(){
    this.listar=[];
    for(let i=0;i<this.pacientes.length;i++){
        this.listar.push(false); 
    }
  }
  constructor(private _cargaDatos:CargaImagenesService,
              private router:Router,
              private _auth:AuthService) { 
                this._cargaDatos.pacientesAsObservable().subscribe(data=>{
                  //this.pacientes=data;
                  this.pacientes=JSON.parse(JSON.stringify(data));
                  this.actualizarListar();
                  
                });

                //console.log('reporteComponent->constructor->pacientes:',this.pacientes);
                this.nivelUsuario=this._auth.nivelUsuario();
              }
  filtrarxNombre(nombrebuscar:string){
    //let pacientesArr=this._cargaDatos.buscarPacientes(nombrebuscar);
    if(nombrebuscar.length>0){
      this.pacientes=this._cargaDatos.buscarPacientes(nombrebuscar);
      this.actualizarListar();
    }else{
      //this.pacientes=JSON.parse(JSON.stringify(this._cargaDatos.pacientesData())) ;
      //this.pacientes=JSON.parse(JSON.stringify(this._cargaDatos.pacientes)) ;
      this._cargaDatos.pacientesAsObservable().subscribe(data=>{
        this.pacientes=JSON.parse(JSON.stringify(data));
      });
      
      this.actualizarListar();
      this.mostrarStd=false;
      //console.log('filtrar nombre()->listar:',this.listar);
    }

  }
  async ngOnInit() {
    this.mostrarStd=false;
    if(this.pacientes.length===0)
    { await this._auth.leerEmail();
      await this._cargaDatos.leerPacientes(this._auth.actualUser.email);}
      //console.log('reporteComponent->ngOnInit->pacientes:',this.pacientes);
      this.actualizarListar();
      //console.log('reporteComponent->ngOnInit->listar:',this.listar);
      if(this._cargaDatos.cantidad_Preguntas()===0){
        await this._cargaDatos.leerPreguntas();
      }
    }
  async consultarTodos(){
  
    Swal.fire({
      allowOutsideClick:true,
      icon:'info',
      title:'Cargando reporte de todos',
      text:'Espere por favor...'
     });
     Swal.showLoading();
    await this._cargaDatos.leerEvaluacionesPacAll();
     for(let i=0;i<this._cargaDatos.cantidad_Evaluaciones();i++){
       this.n_pos.push(i);
      // var evaluacion=this._carga.leerEvaluacion(i);//se recupera de datos local, 
      // this.evaluaciones.push(evaluacion);
    
     }

    if(this._cargaDatos.cantidad_Evaluaciones()>0){
      this.mostrarStd=true;
    }else{
      this.mostrarStd=false;
    }
    Swal.close();
  }
  async consultarPacientes(formu:NgForm){
    if(formu.invalid) {
      console.log('Error en Formulario');
      return;
    }
    //console.log('Consulta individual',formu);
    Swal.fire({
      allowOutsideClick:true,
      icon:'info',
      title:'Cargando consulta',
      text:'Espere por favor...'
     });
     Swal.showLoading();
    let _idPacientes:string[]=[];
    let i:number=0;
    this.n_pos=[];
   // _idPacientes=this.email_consulta.split(';');
     for(i=0;i<this.listar.length;i++){
        if(this.listar[i]){
          _idPacientes.push(this.pacientes[i].idPaciente);
        }
     }
    console.log('_IdPacientes seleccionados:',_idPacientes);
    if(_idPacientes.length===0){
      console.log('No hay ningún paciente seleccionado, listar:',this.listar);
      Swal.close();
      return;
    }
    await this._cargaDatos.leerEvaluacionesPaciente(this.pacientes[0].creadoPor.toUpperCase(),_idPacientes[0].trim(),false);
    
   // console.log('reporte.component->consultarCorreo->idPacientes: ',_idPacientes);
    for( i=1;i<_idPacientes.length;i++){
      if(_idPacientes[i].trim().length>0)
      {await this._cargaDatos.leerEvaluacionesPaciente(this.pacientes[0].creadoPor.toUpperCase(),_idPacientes[i].trim(),true);}
    
    }
    
    if(_idPacientes.length>0){
      this.mostrarStd=true;
    }
    //console.log('cantidad de evaluaciones:',this._cargaDatos.cantidad_Evaluaciones());
    if(this._cargaDatos.cantidad_Evaluaciones()===0){
      this.mostrarStd=false;
    }
     for( i=0;i<this._cargaDatos.cantidad_Evaluaciones();i++){
       this.n_pos.push(i);
      // var evaluacion=this._cargaDatos.leerEvaluacion(i);//se recupera de datos local, 
      // this.evaluaciones.push(evaluacion);
      //  console.log('Evaluacion',this._cargaDatos.leerEvaluacion(i));
      //console.log('errrir');
     }
     Swal.close();
  }
  irHome(){
    this.router.navigateByUrl('/home');
  }
  async reporte_TDA_a_Excel(){
    //console.log('REPORTE:',this._cargaDatos.evaluaciones_2_json());
    //await this._cargaDatos.leerAutoEvaluacionesAll();
    let fecha=new Date();
    let idFecha=fecha.getFullYear()*10000+(fecha.getMonth()+1)*100+fecha.getDate();
    console.log('idFecha:',idFecha);
    let idHora=fecha.getHours()*100+fecha.getMinutes();
    console.log('idHora:',idHora);
    this._cargaDatos.grabarExcelAutoEvaluacionesTDA(`${idFecha}_${idHora}_Reporte_TDA.xlsx`);
    console.log('despues de Reporte.xlsx');
}
  reporte_a_Excel(){
      //console.log('REPORTE:',this._cargaDatos.evaluaciones_2_json());
      let fecha=new Date();
      /*console.log('time_ms:',fecha.getTime());
      fecha.setTime(1701712213875) ;

      console.log('fecha-2:',fecha);*/
      let idFecha=fecha.getFullYear()*10000+(fecha.getMonth()+1)*100+fecha.getDate();
      console.log('idFecha:',idFecha);
      let idHora=fecha.getHours()*100+fecha.getMinutes();
      console.log('idHora:',idHora);
      this._cargaDatos.manageExcelFile(`${idFecha}_${idHora}_Reporte.xlsx`);
      console.log('despues de Reporte.xlsx');
  }
}
