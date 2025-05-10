//import { UsuarioModel } from "./usuario.model";



export class Pregunta{
    codigo:string;
    Enunciado:string;
    E_url:string;
    public op0:number;
    op1:string;
    op2:string;
    op3:string;
    op4:string;
    op1url:string;
    op2url:string;
    op3url:string;
    op4url:string;
    n_grupo:number;
    
  }
export class gruposName{
  n_grupo:number;
  nombre:string;
  siglas:string;
  cantidad_P:number;//cantidad de preguntas del grupo
  visible:boolean;
  
  puntuacion?:number;
  percentil?:number;
  meses?:number;
  nivel_DA?:number;
  
  constructor(){
  
    this.puntuacion=0;
    this.percentil=0;
    this.meses=0;
    this.nivel_DA=0;
  };

}

export class Evaluacion{
  //usuario:UsuarioModel;
  //email:string;
  idPaciente:string;
  fecha_ini:Date;
  fecha_fin:Date;
  preguntas:number[];
  respuestasOk:number[];
  public respuestas:number[];
  public calificacion:number;
  public contestadas:number;
  finalizado:boolean;
}
export class Reporte{
  Id:number;
  prueba:string;          
  email:string;
  contestadas:number;
  calificacion: number;
  calificacionMAX: number;
  FechaIni:Date;
  Duracion:number;
}