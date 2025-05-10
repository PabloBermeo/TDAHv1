import { Component, Input, OnInit } from '@angular/core';
import { Evaluacion, Pregunta } from '../../models/pregunta.model';
import { AuthService } from '../../services/auth.service';
import { CargaImagenesService } from '../../services/carga-imagenes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styles: []
})
export class EstadisticasComponent implements OnInit {
  @Input() correoElectronico:string;
  @Input() verTodos:boolean;
  @Input() soloUltima:boolean;
  verEstadisticas:boolean=false;
  evaluaciones:Evaluacion[]=[];
  n_estadisticas:number;
  n_pos:number[]=[];
constructor(public _carga:CargaImagenesService,
              public auth:AuthService) { 
                
                
              }


   async ngOnInit() {
    console.log('verTodos:',this.verTodos);
    if(this.verTodos===undefined){
      this.verTodos=false;
    }
    /*if(!this.auth.esSuperUsuario()){
      this.verTodos=false;
    }*/
    if(this.soloUltima===undefined){
      this.soloUltima=false;
    }else{
      if(this.soloUltima){
        this.verTodos=false;
      }
    }
    console.log('soloUltima:',this.soloUltima);
    // this.verEstadisticas=false;
    await this._carga.leerPacientes(this.correoElectronico);
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      title: 'Cargando Resultados de pruebas',
      text: 'Espere por favor...'
      
    })
    Swal.showLoading();
      //console.log('en estadísticas-cantidad de Preguntas',this._carga.cantidad_Preguntas());
      //console.log('Ver Todos:',this.verTodos,'-solo Ultima:',this.soloUltima);
     if(!this.verTodos){
       await this._carga.leerEvaluacionesXcorreo(this.correoElectronico);//solo lee de un usuario
      
     
     }else{
      //console.log('En estadisticas ngOnInit');
      await this._carga.leerEvaluacionesPacAll();//realiza la lectura de todos los usuarios
      console.log('leerTodo-cantidad de evalaciones:',this._carga.cantidad_Evaluaciones());
     }
    if(this.soloUltima){
      this._carga.filtrarSoloLastEvaluacion();
    }
    this.n_estadisticas=this._carga.cantidad_Evaluaciones();
     for(var i=0;i<this.n_estadisticas;i++){
       this.n_pos.push(i);
       var evaluacion=this._carga.leerEvaluacion(i);//se recupera de datos local, 
       this.evaluaciones.push(evaluacion);
    
     }
     Swal.close();
     this.verEstadisticas=true;
    // console.log('ngOnInit-evaluaciones',this.evaluaciones);
  }

  
}
