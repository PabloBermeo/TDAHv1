import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';


import { Evaluacion,Pregunta, gruposName } from '../../models/pregunta.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';


@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styles: []
})
export class ResultadosComponent implements OnInit {
  @Input() n_evaluacion:number;
  preguntas:Pregunta[]=[];
  tituloPrueba:string='';
  evaluacion:Evaluacion;
  subgrupo:gruposName[]=[];
 mostrarDetalleAdmin:boolean=false;
  //pruebas:number[]=[];
  mostrar:boolean=false;
  mostrar_E:boolean=true;
  verDetalle:boolean=false;
  fecha:Date;
  fechaUltima:Date;

  constructor(public _carga:CargaImagenesService,
              public auth:AuthService) {
    
                this.mostrar=false;
                this.verDetalle=false;
                this.subgrupo=JSON.parse(JSON.stringify(this._carga.grupos));
                for(let grupo of this.subgrupo){
                  grupo.puntuacion=0;
                  grupo.percentil=0;
                  grupo.meses=0;
                  grupo.nivel_DA=0;
                }
   }


  async ngOnInit() {
    if(this._carga.leerPregunta(0)===undefined){
      await this._carga.leerPreguntas();
    }
    this.mostrar=false;
    this.verDetalle=false;
    //this.mostrarDetalleAdmin=this.auth.esDocente();//////////////////////////////
    this.mostrarDetalleAdmin=this.auth.nivelUsuario()>=1;//////////////////////////////
    //console.log('resultados-n_evaluacion',this.n_evaluacion,'--cantidad Evaluaciones:',this._carga.cantidad_Evaluaciones());
    //var evaluacion:Evaluacion;
    var pregunta:Pregunta; 
                
    //for(var i=0;i<this.n_estadisticas;i++){
      //this.evaluacion=this._carga.leerEvaluacion(this.n_evaluacion);
      if(this.n_evaluacion<=this._carga.cantidad_Evaluaciones()){
      this.evaluacion=this._carga.leerEvaluacion(this.n_evaluacion);
      }else{
        this.evaluacion=this._carga.leerEvaluacion(0);
      }
      if(this.evaluacion.respuestasOk === undefined){
        this.evaluacion.respuestasOk=[];
      }
      //console.log('en resultados: evaluacion:',this.evaluacion);
      for(var j=0;j<this.evaluacion.preguntas.length;j++){
        pregunta=this._carga.leerPregunta(this.evaluacion.preguntas[j]);
        //console.log('estadistica-constructor-pregunta',pregunta);
        if(pregunta!==undefined){
              const resp_j=  this.evaluacion.respuestas[j];          
              if(pregunta.op0 === resp_j || pregunta.op0 ===-1  ){
                this.evaluacion.respuestasOk.push(1);
                //pregunta.op0=JSON.parse(JSON.stringify(this.evaluacion.respuestas[j]));
              }else{
                this.evaluacion.respuestasOk.push(0);
              }
              //Para estimar los subgrupos 
              if(pregunta.n_grupo!==undefined){
                this.subgrupo[pregunta.n_grupo-1].puntuacion+=resp_j===1?2:resp_j===2? 1:0;
              }
              ///////////////////////////////////////////////////////////

        }
      this.preguntas.push(pregunta);
      }
    for(let grupo of this.subgrupo){
      const edad=this._carga.leer_edad(this.evaluacion.idPaciente);
      grupo.percentil=this._carga.calculaPercentil(edad,grupo.puntuacion,grupo.n_grupo);//grupo.puntuacion/(2*grupo.cantidad_P);
    }
    
   // console.log('resultados-ngOnInit->subgrupo:',this.subgrupo);
    //console.log('resultado_cmp-evaluacion',this.evaluacion);
    //console.log('resultado_cmp-preguntas',this.preguntas);
    if(this.evaluacion.fecha_ini instanceof Date){
      this.fecha=this.evaluacion.fecha_ini;
    }else if(typeof(this.evaluacion.fecha_ini)==='number'){
      this.fecha=new Date(Number(this.evaluacion.fecha_ini));
    }else if(typeof(this.evaluacion.fecha_ini)==='string'){  
      this.fecha=new Date(Number(this.evaluacion.fecha_ini));
    }else{
      const aux=JSON.parse(JSON.stringify(this.evaluacion.fecha_ini));
      this.fecha=(new Timestamp(aux.seconds,aux.nanoseconds)).toDate();
    }
    ///define fecha fin
    if(this.evaluacion.fecha_fin instanceof Date){
      this.fechaUltima=this.evaluacion.fecha_fin;
    }else if(typeof(this.evaluacion.fecha_fin)==='number'){
      this.fechaUltima=new Date(Number(this.evaluacion.fecha_fin));
    }else if(typeof(this.evaluacion.fecha_fin)==='string'){  
      this.fechaUltima=new Date(Number(this.evaluacion.fecha_fin));
    }else{
      const aux=JSON.parse(JSON.stringify(this.evaluacion.fecha_fin));
      this.fechaUltima=(new Timestamp(aux.seconds,aux.nanoseconds)).toDate();
    }


    this.mostrar=true;
    this.tituloPrueba=this._carga.tituloPrueba(this.evaluacion.preguntas[0]);
  }

  rightAnswer(i:number):boolean{
    if(i<this.preguntas.length){
      //if(this.evaluacion.respuestasOk[i]===1 && this.evaluacion.respuestas[i] !== -1 ){
      if(this.evaluacion.respuestas[i] === 1 ){
        return true;
      }else{
        return false;
      }
    }
    return false;
  }
clase(opcion:number,n_pregunta:number):string{
  let noSeleccionada:string='btn btn-secondary';
  let opOk:string='btn btn-success';
  let opOk_noSeleccionada:string='btn btn-outline-success';
  let opError:string='btn btn-danger';
  let claseB:string=null;
  let resp:number=this.evaluacion.respuestas[n_pregunta];
  let op0:number;
  if(this.preguntas[n_pregunta].op0 === -1 && resp!==undefined)
    { op0=JSON.parse(JSON.stringify(resp));}
  else
    { op0=this.preguntas[n_pregunta].op0;}
  if(opcion===resp){
    if(resp===op0){
      claseB=opOk;
    }else{
      claseB=opError;
    }
  }else{
    if(opcion===op0){
      claseB=opOk_noSeleccionada;
    }else{
      claseB=noSeleccionada;
    }

  } 
  return claseB;
}

  mostrarDetalle(){
    //console.log('mostrar Detalle',this.preguntas);
    if(this.verDetalle){
      this.verDetalle=false;
    }else{
      this.verDetalle=true;
    }
  }
  edad(_idPaciente:string){
    var edad=this._carga.leer_edad(_idPaciente);
    return edad;
  }
   nombre(_idPaciente:string){
    /*if(_idPaciente===undefined || _idPaciente.length===0  ){
      _idPaciente=this.evaluacion.idPaciente;
    }*/
    //console.log('resultados->evaluacion:',this.evaluacion);
    //var paciente1=this._carga.pacientes.filter(val=>val.idPaciente===_idPaciente);
    var paciente1= this._carga.leer_nombre(_idPaciente);
    //console.log('_idPaciente:',_idPaciente);
    //console.log('paciente1 de leer_n_evaluaciones:',paciente1);
    if(paciente1!==undefined)
      return paciente1; 
    else
      return `Error-no hay nombre en idPaciente: ${_idPaciente}`;
  }
}
