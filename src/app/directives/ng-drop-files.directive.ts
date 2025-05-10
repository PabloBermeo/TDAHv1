import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileItem } from '../models/file-items';

@Directive({
  selector: '[appNgDropFiles]'
})

export class NgDropFilesDirective {

  @Output() mouseSobre: EventEmitter<boolean>=new EventEmitter();
  @Input() archivos:FileItem[]=[];
  @Input() archivosP:FileItem[]=[];
  
  @HostListener('dragover', ['$event'])
  public onDragEnter(event: any){
    this.mouseSobre.emit(true);
    this._prevenirDetener(event);
    //return true;     
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event:Event){
    this.mouseSobre.emit(false);
    //console.log('sale de la figura');
    //return true;
  }

  @HostListener('drop', ['$event'])
   onDrop(event1:Event){
    this.mouseSobre.emit(true);
    const transferencia=this._geTransferencia(event1);
    if(!transferencia){
      return;
    }
    this._prevenirDetener(event1);
    this._extraerArchivos(transferencia.files);
    //console.log('ArchivosP:',this.archivosP);
    //console.log('Archivos:',this.archivos);
    
    this.mouseSobre.emit(false);///////////////////////////////////////    
    
  }


  constructor() { }

  private _geTransferencia(event:any){//para compatibilidad
    //console.log('Evento transfer:');
    //console.log(event);
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    
  }
  private _extraerArchivos(archivosLista: FileList){
    //console.log('En Extraer, archivosLista '+archivosLista);
    //console.log('En Extraer '+Object.getOwnPropertyNames(archivosLista));
    for(const propiedad in Object.getOwnPropertyNames(archivosLista)){
      const archivoTemporal=archivosLista[propiedad]
      if(this._archivoPuedeSerCargado(archivoTemporal)){
          const nuevoArchivo=new FileItem(archivoTemporal);
         // console.log('Extraer archivos',nuevoArchivo);
         // console.log('ArchivosP:',this.archivosP);
          //console.log('archivo.type:',archivoTemporal.type);
          if(this._esImagen(archivoTemporal.type)){
            this.archivos.push(nuevoArchivo);
          }else{
            if(this.archivosP.length===0){
              this.archivosP.push(nuevoArchivo);
            }else{
              this.archivosP[0]=nuevoArchivo;
            }
            
          }
          
      }
    }
    
  }
  private _archivoPuedeSerCargado(archivo:File):boolean{
    if(!this._archivoYaFueUtilizado(archivo.name)&&(this._esImagen(archivo.type)|| this._esPregunta(archivo.type)) ){
      return true;
    }else{
      return false;
    }
  }
  private _prevenirDetener(event){
    event.preventDefault();
    event.stopPropagation();
  }

  private _archivoYaFueUtilizado(nombreArchivo:string):boolean{
    
    for(const archivo of this.archivos)
    {
      if(archivo.nombreArchivo === nombreArchivo ){
        //console.log('El archivo '+nombreArchivo+ ' ya esta agregado');
        return true;
      }
    }
    for(const archivo of this.archivosP)
    {
      if(archivo.nombreArchivo === nombreArchivo ){
       // console.log('El archivo '+nombreArchivo+ ' ya esta agregado');
        return true;
      }
    }

    return false;
  }

  private _esPregunta(tipoArchivo:string):boolean{
    let tipo1:string='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return (tipoArchivo===''|| tipoArchivo=== undefined)?false:tipoArchivo.startsWith('text')||tipoArchivo.startsWith(tipo1);
  }
  private _esImagen(tipoArchivo:string):boolean{
   
    return (tipoArchivo===''|| tipoArchivo=== undefined)?false:tipoArchivo.startsWith('image');
  }

}
