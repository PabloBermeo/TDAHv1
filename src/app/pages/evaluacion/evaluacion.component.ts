import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Evaluacion } from '../../models/pregunta.model';
import { PacienteModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styles: []
})
export class EvaluacionComponent implements OnInit {
  
 // @Input( ) paciente:PacienteModel;
  mostrar:boolean;
  enEvaluacion:boolean;
  opcionSeleccionadas:number[]=[];
  posPreguntas:number[]=[];
  respuestaOk:number[]=[];
  n_Preguntas:number=0;
  idPaciente:string="";
  id_time:number=undefined;

  fechaIni:Date;
  fechaFin:Date

  constructor(public _cargaImagenes:CargaImagenesService,
              private auth:AuthService,
              private activatedRoute:ActivatedRoute,
              private router:Router ) {
                this.enEvaluacion=false;
                this.mostrar=true;
                this.activatedRoute.params.subscribe(params=>{
                  console.log('Estos son los parametro[id]:',params);
                  this.idPaciente=params['idPaciente'];
                  if(params['timeIni']!=='0' && params['timeIni']!==undefined)
                  { this.id_time=Number(params['timeIni']);
                    this.fechaIni=new Date(this.id_time);
                   
                  }
                  else{
                    this.fechaIni=new Date;
                  }
                });
               }


  async ngOnInit() {
    this.enEvaluacion=false;
    this.mostrar=false;
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Cargando Preguntas',
      text: 'Espere por favor...'
      
    })
    Swal.showLoading();
    if(this.id_time!== undefined)
    {this.opcionSeleccionadas=await this._cargaImagenes.readEvaluacionPaciente(this.idPaciente,this.fechaIni.getTime());
     //console.log('evaluacionComponent->ngOnInit->evaluaciones:',this._cargaImagenes.leer_n_evaluaciones(this.idPaciente));
    }
     //this.opcionSeleccionadas=[...lista];
    await this._cargaImagenes.leerPreguntas();

    // this.n_Preguntas=this._cargaImagenes.cantidad_Preguntas();//indica la cantidad de preguntas
    // //if(this.posPregunta===0){
    
    //   for(var i = 1; i < this.n_Preguntas ; i++){
    //   this.posPreguntas.push(i);//inicializa el conteo de las preguntas
    //   }
    Swal.close();
    this.mostrar=true;
    //Inicializa dato
  }

  calificar( ):number{
    this.enEvaluacion=false;//termina prueba
  var calificacion=0;
   for(var i=0;i<this.opcionSeleccionadas.length;i++) {
    
     if(this.opcionSeleccionadas[i] === this._cargaImagenes.leerRespuesta(this.posPreguntas[i])){
        calificacion=calificacion+1;
        this.respuestaOk.push(1);
     }else{
        this.respuestaOk.push(0);
     }
  }
  console.log('calificacion= ',calificacion);
  return calificacion;
  }

  IniciaEvaluacion(caso:number){

    this.posPreguntas=this._cargaImagenes.definePosPreguntas(caso);
    //console.log('Inicia Evaluacion-posPreguntas: ',this.posPreguntas);
    this.mostrar=false;
    this.enEvaluacion=true;
  }
  // enEvaluacion():boolean{
  //   return (this.enEvaluacion && !this.mostrar);
  // }
////////////////////////////////////////////////////////////////////////////
  async respuestaP($event){
    
   var ops:number[]=$event;
    
   //console.log('ops-tipo',typeof()); 
   
   for(var i=0;i<ops.length;i++){
      //this.opcionSeleccionadas=ops.copyWithin(0,0);
      this.opcionSeleccionadas[i]=Number(ops[i]);
   }
    var calificacion=this.calificar();
    //console.log('posPregunta ',this.posPreguntas);
   // console.log('respuestaP-opcionesSelecionadas ',this.opcionSeleccionadas);
    this.mostrar=false;
    var evaluacion:Evaluacion;
    this.fechaFin=new Date;//Inicializa dato
    evaluacion={
       // email:this.auth.actualUser.email,
        idPaciente:this.idPaciente ||this.auth.actualUser.email.toUpperCase(),
        fecha_ini:this.fechaIni,
        fecha_fin:this.fechaFin,
        contestadas: this.opcionSeleccionadas.filter(value=>value!==-1).length,
        preguntas:this.posPreguntas.copyWithin(-1,0,0),
        respuestas:this.opcionSeleccionadas.copyWithin(-1,0,0),
        respuestasOk:this.respuestaOk.copyWithin(-1,0,0),
        calificacion:calificacion,
        finalizado:this.opcionSeleccionadas.filter(value=>value!==-1).length===this.respuestaOk.length
      }
    //this._cargaImagenes.cargarEvaluacionFirebase(evaluacion);
    
    let eval_out:Evaluacion=JSON.parse(JSON.stringify(evaluacion));
    eval_out.fecha_ini=evaluacion.fecha_ini;
    eval_out.fecha_fin=evaluacion.fecha_fin;
    //let n_eval=await this._cargaImagenes.leer_n_evaluaciones(this.idPaciente);
    //console.log('evaluacionComponent->ANTES de subir Firebase>evaluaciones:',eval_out);
    await this._cargaImagenes.cargarEvaluacionPacFirebase(this.idPaciente||eval_out.idPaciente, eval_out);
    //n_eval=await this._cargaImagenes.leer_n_evaluaciones(this.idPaciente);
    //console.log('evaluacionComponent->DESPUES de subir Firebase>evaluaciones:',n_eval);
    //console.log('después, Numero Evaluaciones:',this._cargaImagenes.leer_n_evaluaciones(this.idPaciente))
    //this.router.navigate(['/resultadoActual']);
    this.router.navigate(['/reporte']);
    //window.location.reload();
    

  }

}
