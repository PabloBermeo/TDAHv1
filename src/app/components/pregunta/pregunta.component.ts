
import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
//import { isNumeric } from 'rxjs/internal-compatibility';

import { Pregunta, gruposName } from '../../models/pregunta.model';
import { CargaImagenesService } from '../../services/carga-imagenes.service';

@Component({
  selector: 'app-pregunta',
  templateUrl: './pregunta.component.html',
  styles: []
})
export class PreguntaComponent implements OnInit {
  @Input() n_preguntas:number[]=[];
  @Input() opcionesSeleccionadas:number[]=[];
   @Output() opcionR:EventEmitter<number[]>=new EventEmitter();
   //variante:number[]=[];
   preguntas:Pregunta[]=[];

 tamanio_p:number;
 
 pos:number=0;//la posición 0 es la primera pregunta.
  // pregunta:Pregunta;
  //opcionS:number;
  
  fin:boolean=false;
  siguiente:boolean=true;
  mensaje:boolean=false;
  itemActivo:number=0;
  elementosVisibles:boolean[]=[];
  grupos:gruposName[]=[];
  constructor(public _cargaImagenes:CargaImagenesService) { 
    this.tamanio_p=10;//tamaño de los bloques de preguntas
    
    //this.opcionS=0;
    this.fin=false;
  }
  respuesta(value:number[]){
    //Función que envia el vector de respuestas/opciones seleccionadas de la evaluación
    //se envía a la página padre.
    var out_value:number[]=[];
    //this.n_tamanios=Math.floor(this.n_preguntas.length/this.tamanio_p);
    for(let i=0;i<value.length;i++){
      
      out_value.push(value[i]);//actualiza a las opciones originales
      //out_value.push(this.old_pos(value[i],this.variante[i]));//actualiza a las opciones originales
    }
    //console.log('valor emitido',out_value);
     this.opcionR.emit(out_value);
    // console.log('preguntaComponent->respuesta->opcionesSeleccionadas:',this.opcionesSeleccionadas);
   }
   finalizaXTime(){
     //console.log(`finalizaXTime-opciones seleccionadas ${this.opcionesSeleccionadas}--length:${this.opcionesSeleccionadas.length}`);
     /*let no_respondidas:number=this.n_preguntas.length-this.opcionesSeleccionadas.length;
     for(let i=0;i<no_respondidas;i++){
       this.opcionesSeleccionadas.push(-1);
     }//*/
     //console.log('finalizaXTime-opciones seleccionadas22',this.opcionesSeleccionadas);
     //console.log('n_preguntas',this.n_preguntas);
     this.respuesta(this.opcionesSeleccionadas);
   }
   ngOnInit() {
    //let n_v:number;
    let cantidad_grupos=0;
    for(let i=0;i<this.n_preguntas.length;i++){
      let pregunta_ori:Pregunta;
      pregunta_ori=this._cargaImagenes.leerPregunta(this.n_preguntas[i]);
      this.preguntas[i]=(pregunta_ori);
      if(Number(pregunta_ori.n_grupo)>cantidad_grupos)
      {cantidad_grupos=Number(pregunta_ori.n_grupo);}
    }
    if(this.opcionesSeleccionadas === undefined || this.opcionesSeleccionadas.length===0)
    {for(let i=0;i<this.n_preguntas.length;i++)
      {this.opcionesSeleccionadas.push(-1);}
    }
    console.log('this.preguntas',this.preguntas);

    this.grupos=JSON.parse(JSON.stringify(this._cargaImagenes.grupos)) ;

  }
  visible_todos=true;
  todos(){
    //console.log(event);
    this.visible_todos=!this.visible_todos;
    this.grupos.forEach(grupo=>{grupo.visible=this.visible_todos});
    console.log('visible_todos:',this.visible_todos);
    
  }
  scrollToElement(elementId: string, index:number): void {
    const element = document.getElementById(elementId);
    if (element) {
      var position=element.getBoundingClientRect().top+window.scrollY;
           
      //window.scrollBy({top:position-60, behavior:'smooth'})
      //var scrollOptions:ScrollIntoViewOptions={behavior:'smooth',block:'start',inline:'nearest'};
     // element.scrollIntoView(scrollOptions);
      
      window.scrollTo({ top: position-60, behavior: 'smooth' });
      this.itemActivo=index;
      console.log('index:',index);
      console.log('element',element);
    }
  }

  valorSiguiente(valor:boolean){
    this.siguiente=valor;
  }

  
  cerrar(forma:NgForm){
    /*Object.values(forma.controls).forEach(control=>{
      this.opcionS=control.value;
      //console.log('OpcionS-valores:',this.opcionS);
      } );
      //console.log(`cerrar()-ini,this.opcionS ${this.opcionS}-pos:${this.pos}`);
      if(this.opcionS===null || this.opcionS===undefined){
        this.opcionS=0;
      }//*/
      /*if(this.opcionS>0){
        if(this.pos+1>this.opcionesSeleccionadas.length){//si es el último ingresa al vector
              this.opcionesSeleccionadas.push(this.opcionS);
              forma.reset();
        }else {//si ya existe actualiza el valor
          this.opcionesSeleccionadas[this.pos]=this.opcionS;
          if(this.siguiente && this.pos+1<this.opcionesSeleccionadas.length){
            this.opcionS=this.opcionesSeleccionadas[this.pos+1]
          }
            
          
        }

      }else if(this.opcionS===0){
        this.mensaje=true;//mensaje de advertencia
        if(!this.siguiente){//cuando se regresa no hay mensaje
          this.mensaje=false;
        }
      }//*/
      console.log('preguntaComponent->cerrar()-Opciones seleccionadas',this.opcionesSeleccionadas);
     // console.log(`cerrar()-fin,this.opcionS ${this.opcionS}-pos:${this.pos}`);
    
    return;
  }


isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
 esNumero(valor:any):boolean{
 // console.log('es numero',isNumeric(valor));
 return this.isNumeric(valor);
}
///////////////////////////////////////////////////
//Vectores para randomizar para 4 opciones
p1:number[]=[1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4];
p2:number[]=[2,2,3,3,4,4,1,1,3,3,4,4,1,1,2,2,4,4,1,1,2,2,3,3];
p3:number[]=[3,4,2,4,2,3,3,4,1,4,1,3,2,4,1,4,1,2,2,3,1,3,1,2];
p4:number[]=[4,3,4,2,3,2,4,3,4,1,3,1,4,2,4,1,2,1,3,2,3,1,2,1];

private old_pos(pos_ori:number,opcion_v:number):number{
  var old_pos:number=0;//valor por default
 
  if((pos_ori===1)||(pos_ori.toString()==="1")){
    old_pos=this.p1[opcion_v];
  }
  if((pos_ori===2)||(pos_ori.toString()==="2")){
    old_pos=this.p2[opcion_v];
  }
  if((pos_ori===3)||(pos_ori.toString()==="3")){
    old_pos=this.p3[opcion_v];
  }
  if((pos_ori===4)||(pos_ori.toString()==="4")){
    old_pos=this.p4[opcion_v];
  }
  return old_pos;
}




}
