import { inject, Injectable } from '@angular/core';
import { FileItem } from '../models/file-items';
import * as XLSX from 'xlsx';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Pregunta,Evaluacion, Reporte, gruposName } from '../models/pregunta.model';
import { PacienteModel, UsuarioModel } from '../models/usuario.model';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, firstValueFrom, map, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
//FIREBASE y FIRESTORAGE
import {doc as docRef ,setDoc,Firestore,collectionData, docData,updateDoc, writeBatch, 
  Timestamp, deleteDoc, collection,
  getDoc,
  DocumentReference} from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';
  


@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  //let word=(<any>data).name;
  //private excel_string:string='';
  private CARPETA_IMAGENES='img'; 
  private CARPETA_PREGUNTAS='Preguntas';
  private CARPETA_PACIENTES='Pacientes';
  private Collection_ESTADISTICAS='estadisticas';
  private EXCEL_Local='../../BD_preguntas1.xlsx';
  //private Doc_IdPacientes='IdPacientes';

  private pacientes:PacienteModel[]=[];
  private preguntas:Pregunta[]=[];
  private evaluaciones:Evaluacion[]=[];
  private edadesxScore:any[]=[];
  private percentiles:any[]=[];
  private percentilesTDA:any[]=[];
  private ini1:number[]=[1,211,1,21,41,61,81,101,121,141,161];//define inicio del grupo de preguntas
  private fin1:number[]=[210,270,20,40,60,80,100,120,140,160,185];
  private usuariosAll:UsuarioModel[]=[];
  public cuestionarioActivos=[
    {id:1,nombre:'PEP-3',activo:false,ini1:1  ,npreguntas:210},
    {id:2,nombre:'TDAH' ,activo:true ,ini1:211,npreguntas:60},
    
  ];
  public grupos:gruposName[]=[];
  private titulosPreguntas:string[]=[];//['Matematicas 1',];
  private lecturaCompleta:boolean=false;
  //////////////////////////////////////////////////////////////////////
  private pacientesPublic=new BehaviorSubject<PacienteModel[]>([]);
  pacientesData(){
    return this.pacientes;
  }
  leer_edad(id_paciente:string){
    const edad=this.pacientes.filter(paciente=>paciente.idPaciente===id_paciente)[0].edad;
    return edad;
  }
  leer_nombre(id_paciente:string){
    const nombre=this.pacientes.filter(paciente=>paciente.idPaciente===id_paciente)[0].nombre;
    return nombre;
  }
  pacientesAsObservable(){
    return this.pacientesPublic.asObservable();
  }//this.devicesPublic.next(this.devices);//
  //////////////////////////////////////////////////////////////////////
  //private firestore=inject(Firestore);
  constructor(//private db:  AngularFirestore,
              private firestore:Firestore,
              private storage1:Storage,
              public _auth:AuthService,
              private readonly _http:HttpClient) {
                let titulos:string[]=['Matematicas 1','PEP 3','Matematicas 3','Matematicas 4','Matematicas 5','Geometría 1','Geometría 2','Estadística 1','Com1','Com2'];
                for(let i=0;i<this.ini1.length;i++){
                  this.titulosPreguntas[this.ini1[i]]=titulos[i];
                } 
               //console.log('carga: titulosPreguntas',this.titulosPreguntas);
               this.leerEdades_y_Percentil().then(data_edad=>{
                  console.log('DATOS de edades y Percentiles...');
                });
              }

  tituloPrueba(preguntaIni:number):string{
    return this.titulosPreguntas[preguntaIni];
  }
  limpiaPacientes_Evaluaciones(){
    this.pacientes=[];
    this.evaluaciones=[];
  }
    definePosPreguntas(caso:number) :number[]{

         let posPreguntas:number[]=[];
         for(let i=this.ini1[caso-1];i<=this.fin1[caso-1];i++){
                  posPreguntas.push(i);
         }
         return posPreguntas;
    }
  cantidad_Preguntas():number{
    if(this.preguntas===undefined ||this.preguntas.length===0 ){
      return 0;
    }
    return this.preguntas.length+1;
  }
  leerRespuesta(pos:number):number{
    
    if(pos<=this.preguntas.length ){
     // console.log('leer Pregunta',this.preguntas[pos-1].op0);
      return this.preguntas[pos-1].op0;
    }else{
      return -1;
    }
    
  }
   leerPregunta(pos:number):Pregunta{
    //console.log(`leer Pregunta()`,this.preguntas[pos-1],`pos:${pos-1}`);
    if(pos<this.preguntas.length ){
      //console.log(`leer Pregunta()-if- {this.preguntas[pos-1]}-pos:${pos-1}`);
      return this.preguntas[pos-1];
    }else{
      return this.preguntas[this.preguntas.length-1];
    }
    
  }
  ////////////////////////////
  async actualizarFile(pos_i:number){
    //return console.log("actualizarFile(pos_i:number)...");
    

   let path=`../../assets/imgPreguntas/${this.preguntas[pos_i].codigo}`;
   
   let archivo=`${path}E.png`;
   let ext_file=['E.png','op1.png','op2.png','op3.png','op4.png']
   for(let i=0;i<ext_file.length;i++){
      archivo=`${path}${ext_file[i]}`;
   await this._http.get(archivo,{responseType: 'arraybuffer'}).toPromise().then(()=>{
        console.log(`archivo:${archivo} Si existe`);
        if(i===0){this.preguntas[pos_i].E_url=archivo;}
          
        if(i===1){this.preguntas[pos_i].op1url=archivo;}
          
        if(i===2){this.preguntas[pos_i].op2url=archivo;}
          
        if(i===3){this.preguntas[pos_i].op3url=archivo;}
          
        if(i===4){this.preguntas[pos_i].op4url=archivo;}
          
      }).catch(()=>{
        //console.log(`archivo:${archivo} NOOO existe`);
      });
   }



      return;
    
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Lectura para Edades y Percentiles desde EXCEL
  async leerEdades_y_Percentil(){
    await new Promise<any>((resolve,reject)=>{
      let num_pregunta:number;
      
      this._http.get('../../Edades_y_Percentiles.xlsx',{responseType: 'arraybuffer'})
            .subscribe({next:data=>{
              var dat_8 = new Uint8Array(data);
              var arr = new Array();
              for(var i = 0; i != dat_8.length; ++i) arr[i] = String.fromCharCode(dat_8[i]);
              var bstr = arr.join("")
              const workb:XLSX.WorkBook=XLSX.read(bstr,{type:'binary'});
              //console.log('Archivo Excel',bstr);
              //lee los nombres de las hojas
              const nombre_hojas:string[]=workb.SheetNames;
              //lee la primera hoja
              const hoja1:XLSX.WorkSheet=workb.Sheets[nombre_hojas[0]];
              //console.log('En "Edades_y_Percentiles.xlsx" Excel:hoja1:',hoja1);
               var data1:string[]=XLSX.utils.sheet_to_json(hoja1);
              // console.log('En "Edades_y_Percentiles.xlsx"->1ra Hoja:',data1);
               this.edadesxScore=data1;
               //lee la primera hoja
             if(nombre_hojas.length<3){
              console.error('En "Edades_y_Percentiles.xlsx" sólo existen las hojas:', nombre_hojas);
               return;
             }else{
               const hoja2:XLSX.WorkSheet=workb.Sheets[nombre_hojas[1]];
               var data2=XLSX.utils.sheet_to_json(hoja2);
               this.percentiles=data2;
                //console.log('En "Edades_y_Percentiles.xlsx"->2da Hoja:',data2);
                const hoja3:XLSX.WorkSheet=workb.Sheets[nombre_hojas[2]];
                var data3=XLSX.utils.sheet_to_json(hoja3);
                this.percentilesTDA=data3;
               // console.log('En "Edades_y_Percentiles.xlsx"->3ra Hoja:',data3);
                /*
               this.calculaxTDAPercentil(6,11,3);
                this.calculaxTDAPercentil(7,25,7);
                this.calculaxTDAPercentil(8,25,5);
                this.calculaxTDAPercentil(9,35,6);
                this.calculaxTDAPercentil(10,40,3);
                this.calculaxTDAPercentil(11,45,4);
                this.calculaxTDAPercentil(12,44,2);
                this.calculaxTDAPercentil(13,43,1);
                this.calculaxTDAPercentil(14,44,2);
                this.calculaxTDAPercentil(15,45,3);
                this.calculaxTDAPercentil(16,47,4);*/

              }

             //console.log('cargaImagenes->leerPreguntas->this.preguntas:',this.preguntas) ;
            },error:err=>{
             // console.log('error en lectura de preguntas: ',err);
              reject(err);
            },
            complete() {
              resolve(true);
            },
          });
    })
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Lectura de preguntas desde el EXCEL
  async leerPreguntas(){
   //let file:File;
   /*console.log('En leerPreguntas:');
   await this.leerEdades_y_Percentil().then(data_edad=>{
     console.log('DATOS de edades y Percentiles:',data_edad);
   }); */
    if(!this.lecturaCompleta && this.preguntas.length>0){ console.log('Intentando leerPreguntas()pero ya estan registradas');return;}

    try {
      
      
      await new Promise<any>((resolve,reject)=>{
        let num_pregunta:number;
        
        this._http.get(this.EXCEL_Local,{responseType: 'arraybuffer'})
              .subscribe({next:data=>{
                var dat_8 = new Uint8Array(data);
                var arr = new Array();
                for(var i = 0; i != dat_8.length; ++i) arr[i] = String.fromCharCode(dat_8[i]);
                var bstr = arr.join("")
                const workb:XLSX.WorkBook=XLSX.read(bstr,{type:'binary'});
                //console.log('Archivo Excel',bstr);
                //lee los nombres de las hojas
                const nombre_hojas:string[]=workb.SheetNames;
                //lee la primera hoja
                const hoja1:XLSX.WorkSheet=workb.Sheets[nombre_hojas[0]];
                //console.log('Archivo Excel:hoja1:',hoja1);
                var data1:Pregunta[]=XLSX.utils.sheet_to_json(hoja1);
                for(const pregunta of data1){
                  var preguntaIn:Pregunta;
                  preguntaIn={
                      codigo:pregunta.codigo,
                      Enunciado:this._estaDefinido(pregunta.Enunciado),
                      op1: this._estaDefinido(pregunta.op1),
                      op2:(pregunta.op2!== undefined)?pregunta.op2:'',
                      op3:(pregunta.op3!== undefined)?pregunta.op3:'',
                      op4: this._estaDefinido(pregunta.op4),
                      op0:pregunta.op0,
                      E_url:'',//`${path}E.png`,
                      op1url:'',//`${path}op1.png`,
                      op2url:'',//`${path}op2.png`,
                      op3url:'',//`${path}op3.png`,
                      op4url:'',//`${path}op4.png`,
                      n_grupo:(pregunta.n_grupo!==undefined)?pregunta.n_grupo:0,
                  }
                //console.log('pregunta In',preguntaIn);
                num_pregunta=Number(pregunta.codigo.substring(1,4));
                //console.log('CargaImagenes->leerPreguntas->num_pregunta:',num_pregunta);
                if(num_pregunta!==0)
                  this.preguntas[num_pregunta-1]=preguntaIn;
                } 
              //lee la primera hoja
              if(nombre_hojas.length<2){
                console.log('Solamente existen las hojas:', nombre_hojas);
                console.log('Se definaran por default los valores de los grupos');
                this.grupos=[{
                  n_grupo:1,
                  nombre:'Cognición Verbal/Preverbal',
                  siglas:'CVP',
                  visible:true,
                  cantidad_P:34
                },
                {n_grupo:2,nombre:'Lenguaje Expresivo',siglas:'LE',visible:true,cantidad_P:25},
                {n_grupo:3,nombre:'Lenguaje Receptivo',siglas:'LR',visible:true,cantidad_P:19},
                {n_grupo:4,nombre:'Motricidad Fina',siglas:'MF',visible:true,cantidad_P:20},
                {n_grupo:5,nombre:'Motricidad Gruesa',siglas:'MG',visible:true,cantidad_P:15},
                {n_grupo:6,nombre:'Imitación Viso-Motora',siglas:'IVM',visible:true,cantidad_P:10},
                {n_grupo:7,nombre:'Expresión Afectiva',siglas:'EA',visible:true,cantidad_P:11},
                {n_grupo:8,nombre:'Reciprocidad Social',siglas:'RS',visible:true,cantidad_P:12},
                {n_grupo:9,nombre:'Conductas Motoras Características',siglas:'CMC',visible:true,cantidad_P:15},
                {n_grupo:10,nombre:'Conductas Verbales Características',siglas:'CVC',visible:true,cantidad_P:11},
                {n_grupo:11,nombre:'Problemas Conductuales',siglas:'PC',visible:true,cantidad_P:10},
                {n_grupo:12,nombre:'Auto-Cuidado Personal',siglas:'ACP',visible:true,cantidad_P:13},
                {n_grupo:13,nombre:'Conducta Adaptativa',siglas:'CA',visible:true,cantidad_P:15},
                {n_grupo:14,nombre:'ESTAN VALORES POR DEFAULT',siglas:'AAA',visible:true,cantidad_P:0},
                //{n_grupo:15,nombre:'TDA',siglas:'TDA',visible:true,cantidad_P:60},
                ]
                return;
              }else{
                const hoja3:XLSX.WorkSheet=workb.Sheets[nombre_hojas[2]];
                //console.log('Archivo Excel:hoja3:',hoja3);
                  var data3:gruposName[]=XLSX.utils.sheet_to_json(hoja3);
                  for(const _data of data3){
                    var grupo:gruposName;
                    grupo={
                        n_grupo:this._estaDefinido(_data.n_grupo),
                        nombre: this._estaDefinido(_data.nombre),
                        siglas: this._estaDefinido(_data.siglas),
                        visible:true,
                        cantidad_P:this._estaDefinido(_data.cantidad_P)
                        //n_grupo:(pregunta.n_grupo!==undefined)?pregunta.n_grupo:'',
                    }
                    this.grupos.push(grupo);
                    //console.log('cargaImagenes->leerPreguntas->data y grupo:',_data,grupo);
                  }  
                 // console.log('cargaImagenes->leerPreguntas->grupos:',this.grupos);
              }

              //console.log('cargaImagenes->leerPreguntas->this.preguntas:',this.preguntas) ;
              },error:err=>{
                console.log('ERROR!!!... en lectura de preguntas: ',err);
                
                reject(err);
                
              },
              complete() {
                resolve(true);
              },
            });
      })
      //Lectura de que opciones o enunciados tienen gráficas, pero las graficas 
      // se encuentra en la carpeta local de publics/imgPreguntas
      const nombres_figuras=docRef(this.firestore,'Preguntas/AAAll-figuras');
      docData(nombres_figuras).subscribe({
          next: figuras=>{
             //console.log('cargaImagenes->leerPreguntas->figuras:',figuras);
            if(figuras===undefined) return;
            else{
              //console.log('cargaImagenes->leerPreguntas->figuras, despues del if:',figuras);
              let todoStr:string=figuras['todo_figuras'];
              todoStr=todoStr.toUpperCase();
              for(let i=0; i<this.preguntas.length; i++){
              //let path=`assets/imgPreguntas/${this.preguntas[i].codigo}`; 
              let path=`imgPreguntas/${this.preguntas[i].codigo}`; 
              let cod=this.preguntas[i].codigo.toUpperCase();
              if(todoStr.indexOf(`${cod}E.PNG`)>=0){
                  this.preguntas[i].E_url=`${path}E.png`;}
              if(todoStr.indexOf(`${cod}OP1.PNG`)>=0){
                    this.preguntas[i].op1url=`${path}op1.png`;}
              if(todoStr.indexOf(`${cod}OP2.PNG`)>=0){
                    this.preguntas[i].op2url=`${path}op2.png`;}
              if(todoStr.indexOf(`${cod}OP3.PNG`)>=0){
                    this.preguntas[i].op3url=`${path}op3.png`;}
              if(todoStr.indexOf(`${cod}OP4.PNG`)>=0){
                    this.preguntas[i].op4url=`${path}op4.png`;}
              }
            }
            
            
          },
          error:err=>{
            console.error('ERROR en leer preguntas en figuras:',err);
            throwError(()=>err);
          },
          complete:()=>{
            if(this.preguntas)
              console.log("leerPreguntas()->this.preguntas:",this.preguntas);
          }
        });//*/
      
    } catch (error) {
      console.error('ERROR!!!... en función leerPreguntas()',error);
        
    }

  }
//////////////////////////////////////////////////////////////////////
async testConnection() {
  try {
    const docRef1:DocumentReference = docRef(this.firestore, 'coleccion/2021');
    getDoc(docRef1).then(snap=>{
      if(snap.exists()){
        console.log('Documento:',snap.data());
      }else {
        console.log('No existe el documento');
      }
    }).catch((error) => {
      console.error('Error al obtener documento:', error);
    });
    // const item$=docData<any>(docRef1);
    // //item$.pipe(map((dat1)=>{console.log(dat1)}));
    // item$.subscribe(data=>{
    //   console.log('data:',data);
    // });//*/
    // console.log('Testconnection:',item$);
    // return false;
  } catch (error) {
    console.error("Error en Firestore:", error);
    throw error;
  }
  /*try {
    const testDoc = docRef(this.firestore, 'test/connection');
    await setDoc(testDoc, { test: new Date().toISOString() });
    const docSnap = await getDoc(testDoc);
    console.log('Conexión exitosa:', docSnap.data());
    return true;
  } catch (error) {
    console.error('Error en conexión:', error);
    return false;
  }//*/
}
//////////////////////////////////////////////////////////////////////

// Método para validar DocumentReference
private esDocumentReferenceValido(docRef: any): boolean {
  return docRef && 
         docRef._key && 
         docRef.firestore && 
         docRef.firestore._databaseId && 
         docRef.firestore._databaseId.projectId === 'apptda-ups';
}
leerNombreGrupo(ngrupo:number){
  if(ngrupo<this.grupos.length && ngrupo>0){
    return this.grupos[ngrupo-1].nombre;
  }else{
    return "No definido";
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getFileXlsBlob(file1:File){
    var reader=new FileReader();
    return new Promise(function(resolve, reject){
      try {
        reader.onload=(function(theFile){
          return function(e){
            //Lee todo el libro del trabajo
            const binarystr:string|ArrayBuffer=e.target?.result||'';////antes estaba string en lugar de 'any'
            const workb:XLSX.WorkBook=XLSX.read(binarystr,{type:'binary'});
            //lee los nombres de las hojas
            const nombre_hojas:string[]=workb.SheetNames;
            //lee la primera hoja
            const hoja1:XLSX.WorkSheet=workb.Sheets[nombre_hojas[0]];
            var data1=XLSX.utils.sheet_to_json(hoja1);
            //console.log('binaryString',binarystr);
            //console.log('data1',data1);
            //lee la segunda hoja si existe
            var data2:any;
            var data3:any;
            if(nombre_hojas.length>=1){
             const hoja2:XLSX.WorkSheet=workb.Sheets[nombre_hojas[1]];
             data2=XLSX.utils.sheet_to_json(hoja2);
             //console.log('data2',data2);
             if(nombre_hojas.length>=2){
              const hoja3:XLSX.WorkSheet=workb.Sheets[nombre_hojas[2]];
              data3=XLSX.utils.sheet_to_json(hoja3);
              //console.log('data2',data2);
             }
            }
            var data:any[]=[];
            data.push(data1);
            data.push(data2);
            data.push(data3);
            console.log('getFileXlsBlob:',data);
            resolve(data);
          };
        })(file1);
        reader.readAsBinaryString(file1);
        //reader.readAsDataURL(file1);       
      } catch (error) {
        reject(error);
      }

    });
 
  }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 buscarPacientes(texto1:string):PacienteModel[]{
    let pacientesArr:PacienteModel[]=[];
    texto1=texto1.toUpperCase();
    for(let paciente of this.pacientes){
      let nombre=paciente.nombre.toUpperCase();
      if(nombre.indexOf(texto1)>=0){
        pacientesArr.push(paciente);
      }
    }
    return pacientesArr;
  }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 calculaTDAPercentil(edad_anios:number,A:number,E:number){
  var percentilesAnio:any;
  let edad_factor=Math.floor(edad_anios);
  const ici=(A-E)*100/(A+E);
  if(edad_anios<17)
  {
    percentilesAnio=this.percentilesTDA.filter(element=> Number(element.Edad_anios)===edad_anios);
  }else{
    percentilesAnio=this.percentilesTDA.filter(element=> Number(element.Edad_anios)===18);
  }
  //console.log('PercentilesAnio',percentilesAnio);
  var eneatipos={ EN_A:0,EN_E:0,EN_AminusE:0,EN_ICI:0 };
  for(const percentil_A of percentilesAnio.filter(element=>element.A!==undefined)){
    if(A<=percentil_A.A){
      eneatipos.EN_A=percentil_A.EN_A;
      break;
    }
  }
  for(const percentil_E of percentilesAnio.filter(element=>element.E!==undefined)){
    if(E<=percentil_E.E){
      eneatipos.EN_E=percentil_E.EN_E;
      break;
    }
  }
  for(const percentil_AminusE of percentilesAnio.filter(element=>element.AminusE!==undefined)){
    if((A-E)<=percentil_AminusE.AminusE){
      eneatipos.EN_AminusE=percentil_AminusE.EN_AminusE;
      break;
    }
  }
  for(const percentil_ICI of percentilesAnio.filter(element=>element.ICI!==undefined)){
    if(ici<=percentil_ICI.ICI){
      eneatipos.EN_ICI=percentil_ICI.EN_ICI;
      break;
    }
  }
  //console.log("Edad:",edad_anios);
  //const msn="Edad:"+edad_anios+'\nA:'+A+"\tEN_A:"+eneatipos.EN_A+"\nE:"+E+"\tEN_E:"+eneatipos.EN_E;
  //console.log(msn,"\nA-E:",A-E,"\tEN_AminusE:",eneatipos.EN_AminusE,"\nICI:",Math.round(ici),"\tEN_ICI:",eneatipos.EN_ICI);
  
  return eneatipos||{ EN_A:0,EN_E:0,EN_AminusE:0,EN_ICI:0 };
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 calculaPercentil(edad_real:number,puntuacion:number,n_grupo:number){
  var percentiles:any;
  var percentil:any;
  var referencia:number;
  const decimal=edad_real-Math.floor(edad_real);
  let edad_factor=Math.floor(edad_real)+(decimal<0.5?0:0.6);//factor 0.6 utilizado para referencia
  edad_factor=edad_factor>7?7:edad_factor<2?2:edad_factor;
  referencia=puntuacion+edad_factor*1000;
  percentiles=this.percentiles.filter(element=> Number(element.Ref)===referencia)[0];
  switch(n_grupo){
    case 1:percentil=percentiles.CVP; break
    case 2:percentil=percentiles.LE;break;
    case 3:percentil=percentiles.LR;break;
    case 4:percentil=percentiles.MF;break;
    case 5:percentil=percentiles.MG;break;
    case 6:percentil=percentiles.IVM;break;
    case 7:percentil=percentiles.EA;break;
    case 8:percentil=percentiles.RS;break;
    case 9:percentil=percentiles.CMC;break;
    case 10:percentil=percentiles.CVC;break;
    case 11:percentil=percentiles.PC;break;
    case 12:percentil=percentiles.ACP;break;
    case 13:percentil=percentiles.CA;break;
    default:
      percentil='';
  }
  return percentil||'';
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 calculaEdades(puntuacion:number,n_grupo:number){
  //const n_grupo1=Number(n_grupo)||0;
  var edad:any;
  switch(n_grupo){
    case 1:edad=this.edadesxScore[puntuacion].Ed_CVP; break
    case 2:edad=this.edadesxScore[puntuacion].Ed_LE;break;
    case 3:edad=this.edadesxScore[puntuacion].Ed_LR;break;
    case 4:edad=this.edadesxScore[puntuacion].Ed_MF;break;
    case 5:edad=this.edadesxScore[puntuacion].Ed_MG;break;
    case 6:edad=this.edadesxScore[puntuacion].Ed_IVM;break;
    case 12:edad=this.edadesxScore[puntuacion].Ed_ACP;break;
    default:
      edad='';
  }
  /*if(puntuacion===56){

    console.log(' edadesxScore:',this.edadesxScore[56]);
    console.log(' puntuacion:',puntuacion);
    console.log(' n_grupo:',n_grupo);
    console.log(' percentil:',percentil);
  }*/
  return(edad);
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 calculaNivelDA(percentil_ini:string|number){
  var perc_string:string=percentil_ini.toString();
  perc_string=perc_string.trim();
  if(perc_string.startsWith("<"))
     return "Grave";
   if(perc_string.startsWith(">"))
     return "Adecuado";
  const percentil=Number(perc_string)||0;
   return (percentil<0.25)?"Grave":(percentil<0.75)?"Moderado":(percentil<0.90)?"Leve":"Adecuado";
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 evaluacionesSubGrupos_2_json(){
  
//  Id	Subtest siglas puntuacion Percentil
let reportes=[];
  let reporte:any;
  let subgrupos:gruposName[]=JSON.parse(JSON.stringify(this.grupos));//copia valores valores
  this.evaluaciones.forEach((evaluacion:Evaluacion,index)=>{
     for(let grupo of subgrupos){
      grupo.puntuacion=0;
      grupo.percentil=0;
      grupo.meses=0;
      grupo.nivel_DA=0;
    }
   // console.log('evaluacionesPac_2_json->nombre:',this.pacientes.filter(value=>value.idPaciente==evaluacion.idPaciente));
    for(let i=0;i<evaluacion.preguntas.length;i++)
    { const _respuesta= evaluacion.respuestas[i];
      const _pregunta:Pregunta=this.leerPregunta(evaluacion.preguntas[i]);
      
      //if(index==0 && i%40==0){console.log('index:',index,'i:',i,'-pregunta:',_pregunta);}
      if(_pregunta===undefined){
        console.log('evaluacionesPac_2_json->respuesta:',_respuesta,'evaluacion.preguntas[i]:',_pregunta);
      }
      let valor_respuesta= _respuesta===1?2:
                         _respuesta===2? 1:
                         _respuesta===3? 0:0;
      subgrupos[_pregunta.n_grupo-1].puntuacion +=valor_respuesta;
    }
    let paciente_rep=this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0];
    for(let grupo of subgrupos){
      //const percentil=grupo.puntuacion/(2*grupo.cantidad_P);
      const percentil=this.calculaPercentil(paciente_rep.edad,grupo.puntuacion,grupo.n_grupo);
      reporte={
        Id:index+1,
        IdPaciente:evaluacion.idPaciente,
        Nombre: paciente_rep.nombre,
        Sexo: paciente_rep.sexo,
        Edad: paciente_rep.edad,
        N_grupo: grupo.n_grupo,
        Subtext: grupo.nombre,
        Siglas: grupo.siglas,
        Puntuacion:grupo.puntuacion,
        Percentil:percentil,//se calcula arriba
        Nivel_DA: this.calculaNivelDA(percentil),
        Edad_desarrollo: this.calculaEdades(grupo.puntuacion,grupo.n_grupo)
        
      }
     // console.log('index:',index,'-reporte:',reporte);
      reportes.push(reporte);
    }

   });
  return reportes;
 }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 evaluacionesPac_2_json(){
  var reporteStr:string="";
//  Id	IdPaciente	Nombre	Pregunta	Respuesta
let reportes=[];
  let reporte:any;
  this.evaluaciones.forEach((evaluacion:Evaluacion,index)=>{
   
   // console.log('evaluacionesPac_2_json->nombre:',this.pacientes.filter(value=>value.idPaciente==evaluacion.idPaciente));
    for(let i=0;i<evaluacion.preguntas.length;i++)
    { const _respuesta= evaluacion.respuestas[i];
      const _pregunta:Pregunta=this.leerPregunta(evaluacion.preguntas[i]);
      //if(index==0 && i%40==0){console.log('index:',index,'i:',i,'-pregunta:',_pregunta);}
      if(_pregunta===undefined){
        console.log('evaluacionesPac_2_json->respuesta:',_respuesta,'evaluacion.preguntas[i]:',_pregunta);
      }
      reporte={
        Id:index+1,
        Prueba: this.tituloPrueba(evaluacion.preguntas[0]),
        idPaciente: evaluacion.idPaciente,
        Nombre:this.pacientes.filter(value=>value.idPaciente===evaluacion.idPaciente)[0]===undefined?'No existe':this.pacientes.filter(value=>value.idPaciente===evaluacion.idPaciente)[0].nombre,
        IdPregunta:evaluacion.preguntas[i],
        Pregunta:_pregunta.Enunciado,
        Respuesta: _respuesta===1?_pregunta.op1:
                    _respuesta===2?_pregunta.op2:
                    _respuesta===3?_pregunta.op3:'',//*/
        Valor_respuesta: _respuesta===1?2:
                         _respuesta===2? 1:
                         _respuesta===3? 0:'',
        N_grupo: _pregunta.n_grupo,
        Grupo: this.grupos[_pregunta.n_grupo-1].nombre,
        Siglas: this.grupos[_pregunta.n_grupo-1].siglas,
        
      }
      
     // console.log('index:',index,'-reporte:',reporte);
      reportes.push(reporte);
    }

   });
  return reportes;
 } 
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 autoevaluacionesTDA_2_json(){

  let reportes=[];
  let reporte:any;
  this.evaluaciones.forEach((evaluacion:Evaluacion,index)=>{
    var fechaIni:Date,fechaFin:Date;

    
    console.log('typeof(fecha_ini):',typeof(evaluacion.fecha_ini),' -instance(..):',evaluacion.fecha_ini instanceof Date);
    if(evaluacion.fecha_ini instanceof Date){
      fechaIni=evaluacion.fecha_ini;
      fechaFin=evaluacion.fecha_fin;
    }else if(typeof(evaluacion.fecha_ini)==='number' || (evaluacion.fecha_ini)){
      fechaIni=new Date(Number(evaluacion.fecha_ini));
      fechaFin=new Date(Number(evaluacion.fecha_fin));
    }else{
      const f1=JSON.parse(JSON.stringify(evaluacion.fecha_ini));
      const f2=JSON.parse(JSON.stringify(evaluacion.fecha_fin));
      fechaIni=(new Timestamp(f1.seconds,f1.nanoseconds)).toDate();
      fechaFin=(new Timestamp(f2.seconds,f2.nanoseconds)).toDate();
    }
    console.log('nombre_Paciente:',this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0]);
    const paciente_filtrado=this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0];
    const error=evaluacion.contestadas-evaluacion.calificacion;
    const ici=(evaluacion.calificacion-error)*100/(evaluacion.calificacion+error);
    const aniosTDAH=paciente_filtrado===undefined?'no definido': this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0].edad;
    var eneatiposTDA={ EN_A:0,EN_E:0,EN_AminusE:0,EN_ICI:0 };
    eneatiposTDA=this.calculaTDAPercentil(paciente_filtrado===undefined?18: this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0].edad,evaluacion.calificacion,error);
    reporte={
      Id:index+1,
      //Prueba: this.tituloPrueba(evaluacion.preguntas[0]),
      Prueba: "TDAH-CarasR",
      //Email: this._auth.actualUser.email,
      idPaciente: evaluacion.idPaciente,
      //Paciente: paciente_filtrado===undefined?'no aplica': this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0].nombre,
      Edad: aniosTDAH,
      N_preguntas:evaluacion.preguntas.length,
      P_Contestadas:evaluacion.contestadas,
      Aciertos:evaluacion.calificacion,
      Errores:error,
      ICI:Math.round(ici*10)/10,
      EN_A:eneatiposTDA.EN_A,
      EN_E:eneatiposTDA.EN_E,
      EN_AminusE:eneatiposTDA.EN_AminusE,
      EN_ICI:eneatiposTDA.EN_ICI,
      //calificacionMAX:evaluacion.preguntas.length,
      FechaIni:fechaIni,
      UltimoAcceso:fechaFin,
      Duracion:((fechaFin.getTime()-fechaIni.getTime())/(60*1000))
    //  Duracion: (evaluacion.fecha_fin.getTime()-evaluacion.fecha_ini.getTime())/1000,
    }
   // console.log('index:',index,'-reporte:',reporte);
    reportes.push(reporte);
   });
   //console.log('evaluaciones_2_json->nuevo resp:', this.evaluacionesPac_2_json());
  return reportes;
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 evaluaciones_2_json(){

  let reportes=[];
  let reporte:any;
  this.evaluaciones.forEach((evaluacion:Evaluacion,index)=>{
    var fechaIni:Date,fechaFin:Date;

    
    console.log('typeof(fecha_ini):',typeof(evaluacion.fecha_ini),' -instance(..):',evaluacion.fecha_ini instanceof Date);
    if(evaluacion.fecha_ini instanceof Date){
      fechaIni=evaluacion.fecha_ini;
      fechaFin=evaluacion.fecha_fin;
    }else if(typeof(evaluacion.fecha_ini)==='number' || (evaluacion.fecha_ini)){
      fechaIni=new Date(Number(evaluacion.fecha_ini));
      fechaFin=new Date(Number(evaluacion.fecha_fin));
    }else{
      const f1=JSON.parse(JSON.stringify(evaluacion.fecha_ini));
      const f2=JSON.parse(JSON.stringify(evaluacion.fecha_fin));
      fechaIni=(new Timestamp(f1.seconds,f1.nanoseconds)).toDate();
      fechaFin=(new Timestamp(f2.seconds,f2.nanoseconds)).toDate();
    }
    console.log('nombre_Paciente:',this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0]);
    const paciente_filtrado=this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0];
    reporte={
      Id:index+1,
      Prueba: this.tituloPrueba(evaluacion.preguntas[0]),
      Email: this._auth.actualUser.email,
      idPaciente: evaluacion.idPaciente,
      Paciente: paciente_filtrado===undefined?'no aplica': this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0].nombre,
      Edad: paciente_filtrado===undefined?'no aplica': this.pacientes.filter(pac1=>pac1.idPaciente===evaluacion.idPaciente)[0].edad ,
      N_preguntas:evaluacion.preguntas.length,
      P_Contestadas:evaluacion.contestadas,
      //calificacionMAX:evaluacion.preguntas.length,
      FechaIni:fechaIni,
      UltimoAcceso:fechaFin,
      Duracion:((fechaFin.getTime()-fechaIni.getTime())/(60*1000))
    //  Duracion: (evaluacion.fecha_fin.getTime()-evaluacion.fecha_ini.getTime())/1000,
    }
   // console.log('index:',index,'-reporte:',reporte);
    reportes.push(reporte);
   });
   //console.log('evaluaciones_2_json->nuevo resp:', this.evaluacionesPac_2_json());
  return reportes;
 }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 old_evaluaciones_2_json():Reporte[]{

  let reportes:Reporte[]=[];
  let reporte:Reporte;
  this.evaluaciones.forEach((evaluacion:Evaluacion,index)=>{
    var fechaIni:Date,fechaFin:Date;

    
    console.log('typeof(fecha_ini):',typeof(evaluacion.fecha_ini),' -instance(..):',evaluacion.fecha_ini instanceof Date);
    if(evaluacion.fecha_ini instanceof Date){
      fechaIni=evaluacion.fecha_ini;
      fechaFin=evaluacion.fecha_fin;
    }else if(typeof(evaluacion.fecha_ini)==='number' || (evaluacion.fecha_ini)){
      fechaIni=new Date(Number(evaluacion.fecha_ini));
      fechaFin=new Date(Number(evaluacion.fecha_fin));
    }else{
      const f1=JSON.parse(JSON.stringify(evaluacion.fecha_ini));
      const f2=JSON.parse(JSON.stringify(evaluacion.fecha_fin));
      fechaIni=(new Timestamp(f1.seconds,f1.nanoseconds)).toDate();
      fechaFin=(new Timestamp(f2.seconds,f2.nanoseconds)).toDate();
    }
    
    reporte={
      Id:index+1,
      prueba: this.tituloPrueba(evaluacion.preguntas[0]),
      email: this._auth.actualUser.email,
      calificacion:evaluacion.calificacion,
      contestadas:evaluacion.contestadas,
      calificacionMAX:evaluacion.preguntas.length,
      FechaIni:fechaIni,
      Duracion:((fechaFin.getTime()-fechaIni.getTime())/(60*1000))
    //  Duracion: (evaluacion.fecha_fin.getTime()-evaluacion.fecha_ini.getTime())/1000,
    }
   // console.log('index:',index,'-reporte:',reporte);
    reportes.push(reporte);
   });
  return reportes;
 }
getReport():Observable<any>{
  const headers=new HttpHeaders().set('Content-Type','application/json');

  return this._http.get('http://localhost:4100/v1/api/report',{headers, responseType:'blob' as 'json'});
}
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
async grabarExcelAutoEvaluacionesTDA(filename:string){
  console.log('Evaluaciones antes de leer AutoEvaluaciones',this.evaluaciones);
  const old_evaluaciones=this.evaluaciones;
  await this.leerAutoEvaluacionesAll();
  console.log('Evaluaciones despues de leer AutoEvaluaciones',this.evaluaciones);
  const worksheet:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.autoevaluacionesTDA_2_json());
  const worksheet2:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.evaluacionesPac_2_json());
  const workbook:XLSX.WorkBook={Sheets:{'reporte':worksheet,'detalle':worksheet2},SheetNames:['reporte','detalle']};

  console.log('esta guardado archivo, worksheet',worksheet);
  XLSX.writeFile(workbook, filename);
  this.evaluaciones=old_evaluaciones;
  return;
}
////////////////////////////////////////////////////////////////////////////
manageExcelFile(filename:string){
  const worksheet:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.evaluaciones_2_json());
  const worksheet2:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.evaluacionesPac_2_json());
  const worksheet3:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.evaluacionesSubGrupos_2_json());
  const workbook:XLSX.WorkBook={Sheets:{'reporte':worksheet,'detalle':worksheet2,'Subtests':worksheet3},SheetNames:['reporte','detalle','Subtests']};

 // console.log('esta guardado archivo, worksheet',worksheet);
  //XLSX.writeFile(workbook, 'Reporte_v1.xlsx');
  XLSX.writeFile(workbook, filename);
  return;
}
////////////////////////////////////////////////////////////////////////////
 old_manageExcelFile(filename:string){
  const worksheet:XLSX.WorkSheet=XLSX.utils.json_to_sheet(this.evaluaciones_2_json());
  const workbook:XLSX.WorkBook={Sheets:{'reporte':worksheet},SheetNames:['reporte']};

 // console.log('esta guardado archivo, worksheet',worksheet);
  XLSX.writeFile(workbook, 'Reporte_v1.xlsx');
  return;
  

}
///////////////////////////////////////////////////////////////////////////////
  _estaDefinido(input:any):any{
    if(input===undefined){
      return '';
    }else{
      return input;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  cantidad_Evaluaciones():number{
    return this.evaluaciones.length;
  }
  leerEvaluacion(pos:number):Evaluacion|undefined{
    if(pos<this.evaluaciones.length ){
     // console.log('leer Pregunta',this.preguntas[pos-1].op0);
      return this.evaluaciones[pos];
    }else{
      return undefined;
    }
    
  }
 // addEvaluacion:boolean=false;//bandera para adjuntar archivos

  
 
 
 
 
 
 
 
 
 async leerEvaluacionesAll_(){
   // this.addEvaluacion=true;//activa bandera para adjuntar archivos
   if(   this._auth.nivelUsuario()<2){
    console.log('Intenta leer todo pero no es SUPERUSUARIO');
    return;//si no es super usuario no continuar.
   }

    //const preguntasDoc10=this.db.collection(`estadisticas`).doc('MRXCZzvsqA9lk1lIL0mP').ref;

    const estadisticasCollection=collection(this.firestore,`${this.Collection_ESTADISTICAS}`);
    var dir_vector:string[]=[];
    var email_user=collectionData(estadisticasCollection) as Observable<any>;
    await new Promise<any> ((resolve,reject)=>{ 
      email_user.subscribe({next:doc1=>{
          console.log('cargaImagenes->leerEvaluacionesAll->doc1[1]:',doc1[1]);        
          if(doc1[0].direcciones===undefined)
          {
            dir_vector=[];
            
          }else{
            let dir_string:string=doc1[0].direcciones;
            dir_vector=dir_string.toUpperCase().split(" ");
          }
          console.log('cargaImagenes->leerEvaluacionesAll->dir_vector:',dir_vector);        
//          console.log('carga-imagenes->leerEvaualcionesAll->email_user->correos:',correos);
          resolve(true);
        },error:err=>{
          reject(err);
        }  
      });
    });

    this.evaluaciones=[];
    for(let correoName of dir_vector){
      //await this.leerEvaluaciones(correoName,true);
      await this.leerEvaluaciones(correoName.toUpperCase(),true);//realiza las minusculas
     //console.log('valor correo:',correoName);
    }
    
  }
  async leerEvaluacionesXcorreo(correoElectronico:string){
    let correo=correoElectronico.toUpperCase();
    if(this.pacientes.length>0){
        let idUsers=this.pacientes.filter(element=>element.creadoPor.toUpperCase()===correo);
        console.log('Carga-imagenes->idUsers:',idUsers);
        this.evaluaciones=[];
        for(let idUser of idUsers){
          await this.leerEvaluaciones(idUser.idPaciente,true);
        }
    }else{
     console.log('No hay evaluaciones') ;
    }
    

  }
  async leerEvaluaciones(id_paciente:string,addEvaluacion:boolean){

    const preguntasDoc2=collection(this.firestore,`${this.Collection_ESTADISTICAS}/evaluaciones/${id_paciente}`);
    //const preguntasDoc2=preguntasDoc1.collection(`${user_email}`).ref;
    
    if(!addEvaluacion){//si se esta adicionando no iniciar vector, es cuando se leen de varios usuarios.
      this.evaluaciones=[];//
    }
    try {
      var docs:string[]=[];
      await new Promise<any>((resolve,reject)=>{
        collectionData(preguntasDoc2).subscribe({next:(docs:any)=>{
              if(docs.length===0){
                resolve(true);
                return;
              }
              for(const evaldoc of docs){
                 const evaluacion:Evaluacion={
                    idPaciente: id_paciente,//evaldoc['email'] || id_paciente,
                    calificacion:evaldoc['calificacion'],
                    contestadas:evaldoc['contestadas'],
                    fecha_ini:evaldoc['fecha_ini'],
                    fecha_fin: evaldoc['fecha_fin'],
                    preguntas: evaldoc['preguntas'],
                    respuestas: evaldoc['respuestas'],
                    respuestasOk:evaldoc['respuestasOk'],  
                    finalizado: evaldoc['finalizado'],  
                 } 
                 evaluacion.respuestasOk=(evaluacion.respuestasOk!== undefined)?evaluacion.respuestasOk:[];
                 this.evaluaciones.push(evaluacion);
              }
              resolve(true);
            },error:err=>{
              console.log('ERROR: en carga-imagenes.service->leerEvaluaciones()');
              reject(err);            
            },complete:()=>{
              resolve(true);
            }

        });
    

      });  
      
      return;
    } catch (error) {
      
      console.log('Error en leerEvaluaciones',error);
      return;
    }

  
    //console.log('leerEvaluaciones()-docs',docs);
    
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  filtrarSoloLastEvaluacion(){
    //console.log('filtrarSoloLastEvaluacion',this.evaluaciones,'--',this.evaluaciones.filter(item=>item===this.evaluaciones[this.evaluaciones.length-1]));
    this.evaluaciones=this.evaluaciones.filter(item=>item===this.evaluaciones[this.evaluaciones.length-1]);
    //console.log('filtrarSoloLastEvaluacion',this.evaluaciones);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async cargarEvaluacionFirebase(evaluacion:Evaluacion){


    const preguntasDoc1=docRef(this.firestore,`${this.Collection_ESTADISTICAS}/evaluaciones/${this._auth.actualUser.email.toUpperCase()}/${Number(evaluacion.fecha_fin)}`);
    setDoc(preguntasDoc1,{
      email:this._auth.actualUser.email.toUpperCase(),
      calificacion: evaluacion.calificacion,
      fecha_ini: evaluacion.fecha_ini,
      fecha_fin: evaluacion.fecha_fin,
      contestadas: evaluacion.contestadas,
      preguntas: evaluacion.preguntas,
      respuestas: evaluacion.respuestas,
      respuestaOk: evaluacion.respuestasOk,
      finalizado:evaluacion.finalizado
    }).then(val=>{
      console.log('Exito en la subida, en Evaluacion:',val);
    }).catch((error)=>{
      console.log("Error en cargar Evaluación: ",error);
    });

    
  }
///////////////////////////////////////////////////////////////////////////////////////////
async crearUsuariosFirebase(archivosP1:FileItem[]){
   //crea usuarios Firebase con los datos de la primera hoja o segunda hoja 
  
try {
  this.usuariosAll=[];
  await this.leerUsuariosExcel(archivosP1);
  //console.log('Usuarios ALL',this.usuariosAll);
  this._auth.nuevosUsuarios(this.usuariosAll);
} catch (error) {
  console.error('Error en crear Usuarios Firebase',error);
}
  
}
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
async leerUsuariosExcel(archivosP1:FileItem[]){
    
  let file:File;
  let blob:any[];
  let usuariosAll:UsuarioModel[]=[];
  file=archivosP1[0].archivo;

  let dataPromise=this.getFileXlsBlob(file);
  await dataPromise.then((blob_0)=>{
    var blob0:any[]=[];
    blob0.push(blob_0);
    //console.log('Blob0',blob0);       
    blob=JSON.parse(JSON.stringify(blob0));;
    
    
    let i=0;
   let dataRef:any;

    if(blob[0].length>1){//si hay más de una hoja, leer los datos de la hoja 2 (i=1)
      i++;
    }
    for(const usuarioRef of blob[0][i]){
        let usuario1:UsuarioModel;
        
        usuario1={
          email: (usuarioRef.Correo!==undefined)?usuarioRef.Correo:'',
          nombre:(usuarioRef.Nombre!==undefined)?usuarioRef.Nombre:'',
          password: (usuarioRef.Contraseña!==undefined)?usuarioRef.Contraseña:'',
          
        }
        usuariosAll.push(usuario1);
      
    }
    this.usuariosAll=usuariosAll;
    
  }).catch(e=>console.log("Error al final leer-Usuarios-Excel: ",e));
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

async Old_cargarPreguntasFirebase(archivosP1:FileItem[]){
    //realiza la carga de las preguntas al Firebase y lee los usuarios de la
    //segunda hoja del archivoP1 y los crea como nuevos usuarios en el Firestore
    let file:File;
    let blob:any[];
    let usuariosAll:UsuarioModel[]=[];
    file=archivosP1[0].archivo;

    // console.log('File: ',file);
    //********************************************************** */
   // this.preguntas=[];
    //********************************************************** */
    let imgPromise=this.getFileXlsBlob(file);
    await imgPromise.then((blob_0)=>{
      //let tarea=new Activity();
      var blob0:any[]=[];
      blob0.push(blob_0);
      //console.log('Blob0',blob0);       
       
      //blob=blob0.copyWithin(-1,0,0);
      blob=JSON.parse(JSON.stringify(blob0));;
      
      var batch=writeBatch(this.firestore);
      let i=0;
      const preguntas_xls=JSON.parse(JSON.stringify(blob0[0][0]));
        console.log('preguntas_xls:',preguntas_xls); 
      if(blob[0].length>1){
        for(const usuarioRef of blob[0][1]){
          let usuario1:UsuarioModel;
          
          usuario1={
            email: (usuarioRef.Correo!==undefined)?usuarioRef.Correo:'',
            nombre:(usuarioRef.Nombre!==undefined)?usuarioRef.Nombre:'',
            password: (usuarioRef.Contraseña!==undefined)?usuarioRef.Contraseña:'',
            
          }
          usuariosAll.push(usuario1);
         
        }
      }
      
      const preguntasRefDoc=docRef(this.firestore,`${this.CARPETA_PREGUNTAS}/x000`);
      batch.set(preguntasRefDoc,preguntas_xls);
      //batch.delete(preguntasRefDoc);//elimina la primera fila, codigo 'x000'
    
      batch.commit().then(function(){
        //console.log("Exito en subida de preguntas");
        archivosP1[0].estaSubiendo=false;
        archivosP1[0].progreso=100;
        
      }).catch(error=>{
        console.log("Error en Cargar Preguntas a Firebase y leer Usuarios en 2da hoja de Excel:",error);
      });

      //console.log('cargaImagenes->Cargar Preguntas Firebase->UsuariosAll',usuariosAll);
     // this._auth.nuevosUsuarios(usuariosAll);
      //console.log('subir preguntas firebase preguntasIn:',preguntasIn);
    }).catch(e=>console.log("Error al final CargaFirebase: ",e));
}
////////////////////////////////////////////////////////////////////////////////

Preguntas_2_JSON():string{
  let todoStr:string="[";
  for(let pr of this.preguntas){
    
    todoStr=`${todoStr} {"codigo":${pr.codigo},"op0":${pr.op0},`;
    if(pr.Enunciado!==undefined){todoStr=`${todoStr} "Enunciado":${pr.Enunciado}, `;}
    if(pr.op1!==undefined){todoStr=`${todoStr}  "op1":${pr.op1},`;}
    if(pr.op2!==undefined){todoStr=`${todoStr}  "op2":${pr.op2},`;}
    if(pr.op3!==undefined){todoStr=`${todoStr}  "op3":${pr.op3},`;}
    if(pr.op4!==undefined){todoStr=`${todoStr}  "op4":${pr.op4},`;}
    if(pr.E_url!==undefined){todoStr=`${todoStr}  "E_url":${pr.E_url},`;}
    if(pr.op1url!==undefined){todoStr=`${todoStr}  "op1url":${pr.op1url},`;}
    if(pr.op2url!==undefined){todoStr=`${todoStr}  "op2url":${pr.op2url},`;}
    if(pr.op3url!==undefined){todoStr=`${todoStr}  "op3url":${pr.op3url},`;}
    if(pr.op4url!==undefined){todoStr=`${todoStr}  "op4url":${pr.op4url},`;}
    todoStr=`${todoStr} },`;//cierra la llave
  }
  todoStr=`${todoStr} ] `;
 console.log('longitud',this.preguntas.length,' todo-STR',todoStr);
return todoStr;
}

///////////////////////////////////////////////////////////////////////////////
  async cargarImagenesFirebase(imagenes:FileItem[]){
    //console.log(imagenes);
    
    var name_archivos:string="";
    

    //console.log('IMAGENES:',imagenes);
    //return;

    for(const item of imagenes){
      
      item.estaSubiendo=true;
      if(item.progreso>=100){
        continue;
      }
      name_archivos=`${name_archivos} ${item.archivo.name}`;
      const archivoRef=ref(this.storage1,`/${this.CARPETA_IMAGENES}/${item.nombreArchivo}`);
      const uploadTask=uploadBytesResumable(archivoRef,item.archivo);
      uploadTask.on('state_changed',(snapshot)=>{
        item.progreso=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
      },error=>{
        console.log("ERROR en cargarImagenesFirebase:",error);
      },async()=>{
          item.url = await getDownloadURL(uploadTask.snapshot.ref);
          this.guardarImagen({ nombre: item.nombreArchivo, url: item.url });
          item.estaSubiendo = false;
      });

      /*
      await uploadBytes(archivoRef,item.archivo).then(snap=>{
        console.log('snap:',snap.metadata.size);
        
      }).catch(error=>{
        console.log("ERROR en cargarImagenesFirebase:",error);
      });//*/
      /*
      await getDownloadURL(archivoRef).then((downloadURL) => {
        item.url = downloadURL;
        item.estaSubiendo = false;
      
        this.guardarImagen({
          nombre: item.nombreArchivo,
          url: item.url
        });
      
      }).catch(error => {
        console.error("Error al obtener URL de descarga:", error);
      });//*/
      //const storageRef=this.storage1['ref'](`/${this.CARPETA_IMAGENES}/`);
      /* await storageRef.child(`${item.nombreArchivo}`).put(item.archivo).then(snap => {
              item.progreso=(snap.bytesTransferred/snap.totalBytes)*100;
       }).finally(()=>{
      
       }).catch(error=>{
         console.log("ERROR en cargarImagenesFirebase:",error);
       });//*/
                
       /*const storageRef_1=this.storage1['ref'](`/${this.CARPETA_IMAGENES}/${item.nombreArchivo}`);
         storageRef_1.getDownloadURL().subscribe({next:downloadURL=>{
          item.url=downloadURL;
          //console.log("getDownLoadURL",item.url);
         item.estaSubiendo=false;
         this.guardarImagen(
           { nombre: item.nombreArchivo,
             url: item.url
           }
         );
       },error:error=>{
         console.log("ERROR en cargarImagenesFirebase en finally",error);
       }});//*/
     } 
     ///////////////////////////////////////////////////
    const preguntasRefDocAll=docRef(this.firestore,`${this.CARPETA_PREGUNTAS}/AAAll-figuras`);
    setDoc(preguntasRefDocAll,{todo_figuras:name_archivos}).catch(error=>{
      console.log('Error subiendo name_archivos nombres de archivos:',error);
    });
  }
 ///////////////////////////////////////////////////////////////////////////////////////////////////////
 async actualizarUrlsImagenes(){//si existen imágenes actualizar los urls
   //return console.log('actualizarUrlsImagenes()...');
    const imagenesCollection=collection(this.firestore,`/${this.CARPETA_IMAGENES}`);
    var imagenes_Data=collectionData(imagenesCollection) as Observable<any>;
    var nameImagenes:string[]=[];
    var urls:string[]=[];
    //console.log('leerEvaluaciones()-email',user_email);
    //console.log('leerEvaluaciones()-preguntasDoc2',preguntasDoc2);
    imagenes_Data.subscribe({next: docs=>{
      console.log('actualizarUrlsImagenes->imagenes_Data->docs:',docs);
      var ndocs_=0;
      for(let data of docs){
        const imagen=data.nombre;
        const url=data.url;
        //console.log("imagen.substring(0,4):",imagen.substring(0,4));
        const preguntasImg=docRef(this.firestore,`${this.CARPETA_PREGUNTAS}/${imagen.substring(0,4)}`);
        docData(preguntasImg).subscribe(doc=>{
          //console.log('actualizarUrlsImagenes->imagenes_Data->docs->data-preguntasImg->doc:',doc);
          if(doc !== undefined){
            ndocs_++;
            var caso=imagen.substring(4,7);
            //console.log('data-preguntasImg->doc:caso',caso);
            switch(caso){
              case 'op1':
                updateDoc(preguntasImg,{op1url:url});//;preguntasImg.update({op1url:urls[i]});
              break;
              case 'op2':
                updateDoc(preguntasImg,{op2url:url});//preguntasImg.update({op2url:urls[i]});
              break;
              case 'op3':
                updateDoc(preguntasImg,{op3url:url});//preguntasImg.update({op3url:urls[i]});
              break;
              case 'op4':
                updateDoc(preguntasImg,{op4url:url});//preguntasImg.update({op4url:urls[i]});
              break;
              default:
                console.log("caso.substring(0,1):",caso.substring(0,1));
                if(caso.substring(0,1).toUpperCase()==='E'){
                  updateDoc(preguntasImg,{E_url:url});//preguntasImg.update({E_url:urls[i]});
                }
      
            }
          }
        });


      };
      
    },error:error=>{
      console.log('Error en actualizarUrlImagenes',error);
      return;
    }})

}
private guardarImagen(imagen:{nombre:string, url:string}){
    
  // this.db.collection(`/${this.CARPETA_IMAGENES}`).doc(`${imagen.nombre}`).set(imagen);
  var carpeta_imag_Ref=docRef(this.firestore,`/${this.CARPETA_IMAGENES}/${imagen.nombre}`);
  setDoc(carpeta_imag_Ref,imagen);
   
  }
/************************************************************************/
// ADMINISTRAR PACIENTES
/************************************************************************/
  public async crearPaciente(paciente:PacienteModel){
    const pacienteDoc=docRef(this.firestore,`${this.CARPETA_PACIENTES}/${paciente.idPaciente}`);
    await setDoc(pacienteDoc,{
      creadoPor:this._auth.actualUser.email.toUpperCase(),
      nombre: paciente.nombre,
      edad: paciente.edad,
      sexo: paciente.sexo,
      idPaciente: paciente.idPaciente,
      n_evaluaciones:paciente.n_evaluaciones,
      fecha_creacion: Date.now(),
      
    }).then(val=>{
      console.log('Exito en la creacion de Paciente, val:',val);
    }).catch((error)=>{
      console.log("Error en creación de paciente: ",error);
    });    
  }
  public async eliminarPaciente(idPaciente_eliminar:string){
    const pacienteDoc=docRef(this.firestore,`${this.CARPETA_PACIENTES}/${idPaciente_eliminar}`);
    await deleteDoc(pacienteDoc).then(val=>{
      console.log('Éxito en eliminar paciente con id:',idPaciente_eliminar,'-val:',val);
    }).catch(err=>{
         console.error('ERROR: en eliminar paciente con id:',idPaciente_eliminar,'-error:',err);
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////
  async leerPacientes(user_email:string):Promise<boolean>{
    const auxPacientes=JSON.parse(JSON.stringify(this.pacientes));
   // console.log('Al inicio carga->leerPacientes->Lista de pacientes:',auxPacientes);
    if(this.pacientes.length>0){
      this.pacientesPublic.next(this.pacientes);//mantiene los últimos valores
      return Promise.resolve(true);
    }
    const preguntasDoc2=collection(this.firestore,`${this.CARPETA_PACIENTES}/`);
    //const preguntasDoc2=preguntasDoc1.collection(`${user_email}`).ref;
    
    
    
    try {
      //var docs:string[]=[];
      //////////////////////////////////////////////////////////
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        title: 'Cargando Pacientes',
        text: 'Espere por favor...'
        
      });
      return await new Promise<boolean>(async(resolve,reject)=>{
        
        Swal.showLoading();
       
        this.pacientes=[];//
        
        collectionData(preguntasDoc2).subscribe({next:async(subs_docs:any)=>{
          const docs=JSON.parse(JSON.stringify(subs_docs));
          if(docs.length===0){
            //this.pacientesPublic.next(this.pacientes);//mantiene los últimos valores
            resolve(true);
            return;
          } 
          
          //console.log('carga->leerPacientes->docs.length:',docs.length);
          // console.log('carga->leerPacientes->docs:',docs);
          // console.log('carga->leerPacientes->sub_docs:',subs_docs);
          let i=0;
          this.pacientes=[];
                for(const pacienteDoc of docs){
                  if(i>=docs.length ||pacienteDoc['creadoPor']===undefined){continue;}
                  if(i===0){this.pacientes=[];}
                  i++;
                  //console.log("PacienteDoc:",pacienteDoc);
                    if(user_email.toUpperCase()===pacienteDoc['creadoPor'].toUpperCase()|| this._auth.nivelUsuario()>1)
                  { 
  
                    const paciente:PacienteModel={
                      creadoPor:pacienteDoc['creadoPor'],
                      idPaciente:pacienteDoc['idPaciente'],
                      nombre:pacienteDoc['nombre'],
                      edad:pacienteDoc['edad'],
                      sexo:pacienteDoc['sexo'],
                      fecha_creacion: new Date(Number(pacienteDoc['fecha_creacion'])),
                      n_evaluaciones: pacienteDoc['n_evaluaciones'],
                    } 
                    let n_eval:number=0;
                    await this.leer_n_evaluaciones(paciente.idPaciente).then(dato=>{
                      //console.log('typeof(dato):',typeof(dato));
                      n_eval=dato;
                    });//
                    paciente.n_evaluaciones=n_eval;
                    this.pacientes.push(JSON.parse(JSON.stringify(paciente)));
                  }
                }
                //console.log('carga->leerPacientes->Lista de pacientes:',this.pacientes);
                //console.log('carga->leerPacientes->Cantidad de elementos de Docs:',docs.length);
                //console.log('carga->leerPacientes->Cantidad de Lista de pacientes:',this.pacientes.length);
                this.pacientesPublic.next(this.pacientes);//actualiza los valores
                resolve(true);//*/
            },error:err=>{
              console.log('ERROR: en carga-imagenes.service->leerPacientes()',err);
              //reject(err);            
              resolve(false);
            },complete:()=>{
            
              
                
                resolve(true);
            }

        });
        

      });  
      
      
    } catch (error) {
      
      console.log('Error en leerPacientes',error);
      return Promise.resolve(false);
    }finally{
      Swal.close();
    }

  
    //console.log('leerEvaluaciones()-docs',docs);
    
  }
  //////////////////////////////////////////////////////////////////////////////////////
  async leer_n_evaluaciones(idPaciente:string ):Promise<number>{

    let n_evaluaciones:number=0;
    if(this.evaluaciones.length>0){
      n_evaluaciones=this.evaluaciones.filter(evaluacion=>evaluacion.idPaciente===idPaciente).length;
      return Promise.resolve(n_evaluaciones);
    }

    const idPacienteDocs=collection(this.firestore,`${this.Collection_ESTADISTICAS}/evaluaciones/${idPaciente}`);
    //const preguntasDoc2=preguntasDoc1.collection(`${user_email}`).ref;

    try {
      //var docs:string[]=[];
      return await new Promise<number>((resolve,reject)=>{
        collectionData(idPacienteDocs).subscribe({next:(docs:any)=>{
              //console.log('carga.sevice->leerEvaluacionesPaciente->docs:',docs);
              if(docs.length===0){
                resolve(0);
                return;
              }
              
              //console.log('carga.service->n_evaluaciones:',docs.length);
              n_evaluaciones=docs.length;
              resolve(n_evaluaciones);//docs.length);
            },error:err=>{
              console.log('ERROR: en carga-imagenes.service->leerEvaluacionesPaciente()');
              reject(err);            
            },complete:()=>{
              resolve(n_evaluaciones);
            }

        });
    

      });  
      
     // return Promise.resolve([]);
    } catch (error) {
      
      console.log('Error en leerEvaluaciones',error);
      return Promise.resolve(0);
    }

  
    //console.log('leerEvaluaciones()-docs',docs);
    
  }

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
async obtenerArchivoEXCELDesdePublic(): Promise<File> {
  
  const blob = await firstValueFrom(this._http.get(this.EXCEL_Local, { responseType: 'blob' }));

  const file = new File([blob], this.EXCEL_Local.replace("/","").replace("..",""), { type: blob.type });
  return file;
}
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
async leerAutoEvaluacionesAll(){
  // this.addEvaluacion=true;//activa bandera para adjuntar archivos
  if(this._auth.nivelUsuario()<2){
   console.log('Intenta leer todo pero no es SuperUsuario');
   return;//si no es super usuario no continuar.
  }
  this.evaluaciones=[];
  const archivoExcel=await this.obtenerArchivoEXCELDesdePublic();
  const fileItemExcel=new FileItem(archivoExcel);
  var ItemsExcel:FileItem[]=[] ;
  ItemsExcel.push(fileItemExcel);
  await this.leerUsuariosExcel(ItemsExcel);
 console.log('usuariosAll',this.usuariosAll);
  for(let usuario of this.usuariosAll){
    if(usuario.email.length>0 &&usuario.email.indexOf('@')>0){
      await this.leerEvaluacionesPaciente(usuario.email.toUpperCase(),usuario.email.toUpperCase(),true);
    }
  }
 }
////////////////////////////////////////////////////////////////////////////
async leerEvaluacionesPacAll(){
  // this.addEvaluacion=true;//activa bandera para adjuntar archivos
  if(this._auth.nivelUsuario()<2){
   console.log('Intenta leer todo pero no es SuperUsuario');
   return;//si no es super usuario no continuar.
  }
  this.evaluaciones=[];
  //console.log('this.pacientes',this.pacientes);
  for(let _paciente1 of this.pacientes){
    if(_paciente1.creadoPor.length>1){

      await this.leerEvaluacionesPaciente(_paciente1.creadoPor,_paciente1.idPaciente,true);
    }
  }
 }

/////////////////////////////////////////////////////////////////////////////////////////////
async readEvaluacionPaciente(idPaciente:string,idTime_ini:number){
  if(this.evaluaciones.length===0){
    await this.leerEvaluacionesPaciente(this._auth.actualUser.email,idPaciente,false);
    if(this.pacientes.length===0){
      await this.leerPacientes(this._auth.leerEmail());
    }
  }//*/
  const eval_pac=this.evaluaciones.filter(value=>value.idPaciente=== idPaciente && value.fecha_ini.getTime()=== idTime_ini);
  var vector:number[]=[];
  //console.log('eval_pac:',eval_pac);
  if(eval_pac.length>0){
    eval_pac[0].respuestas.forEach(value=>vector.push(value));
  }
  //console.log('cargaImagenes->readEvaluacionPaciente->respuestas:',eval_pac[0].respuestas);
  //console.log('cargaImagenes->readEvaluacionPaciente->vector:',vector,'-',typeof(vector));
  return eval_pac[0]===undefined?[]:[...vector];
}
/////////////////////////////////////////////////////////////////////////////////////////////
  async leerEvaluacionesPaciente(user_email:string,idPaciente:string ,addEvaluacion:boolean){

    const idPacienteDocs=collection(this.firestore,`${this.Collection_ESTADISTICAS}/evaluaciones/${idPaciente}`);
    //const preguntasDoc2=preguntasDoc1.collection(`${user_email}`).ref;
    
    if(!addEvaluacion){//si se esta adicionando no iniciar vector, es cuando se leen de varios usuarios.
      this.evaluaciones=[];//
    }
    try {
      //var docs:string[]=[];
      return await new Promise<Evaluacion[]>((resolve,reject)=>{
        collectionData(idPacienteDocs).subscribe({next:(docs:any)=>{
              //console.log('carga.sevice->leerEvaluacionesPaciente->docs:',docs);
              if(docs.length===0){
                resolve([]);
                return;
              }
              for(const evaldoc of docs){
                 const evaluacion:Evaluacion={
                    idPaciente:evaldoc['idPaciente'],
                    calificacion:evaldoc['calificacion'],
                    contestadas:evaldoc['contestadas'],
                    fecha_ini:new Date(Number(evaldoc['fecha_ini']) ),
                    fecha_fin:evaldoc['fecha_fin']!==undefined?new Date(Number(evaldoc['fecha_fin'])):undefined,
                    preguntas: evaldoc['preguntas'],
                    respuestas: evaldoc['respuestas'],
                    respuestasOk:evaldoc['respuestasOk'],  
                    finalizado:Boolean(evaldoc['finalizado']) 

                 } 
                 evaluacion.respuestasOk=(evaluacion.respuestasOk!== undefined)?evaluacion.respuestasOk:[];
                 this.evaluaciones.push(evaluacion);
              }//*/
              //console.log('carga.service->leerEvaluacionesPaciente->evaluaciones:',this.evaluaciones);
              this.pacientes.forEach(paciente=>{
                if(paciente.idPaciente===idPaciente){
                  /*var n_eval_1:number;
                  this.leer_n_evaluaciones(idPaciente).then(n_dato=>{
                    n_eval_1=n_dato as number;
                  });*/
                  paciente.n_evaluaciones=this.evaluaciones.filter(evaluacion=>evaluacion.idPaciente===paciente.idPaciente).length;
                }
              });
              //console.log('carga.service->leerEvaluacionesPaciente->pacientes:',this.pacientes);
              resolve(this.evaluaciones);
            },error:err=>{
              console.log('ERROR: en carga-imagenes.service->leerEvaluacionesPaciente()');
              reject(err);            
            },complete:()=>{
              resolve(this.evaluaciones);
            }

        });
    

      });  
      
      return Promise.resolve([]);
    } catch (error) {
      
      console.log('Error en leerEvaluaciones',error);
      return Promise.resolve([]);
    }

  
    //console.log('leerEvaluaciones()-docs',docs);
    
  }

  async cargarEvaluacionPacFirebase(_Idpaciente:string,evaluacion:Evaluacion){

//console.log('subiendo evaluación a Firebase, evaluacion:',evaluacion);
    const preguntasDoc1=docRef(this.firestore,`${this.Collection_ESTADISTICAS}/evaluaciones/${_Idpaciente}/${Number(evaluacion.fecha_ini)}`);
    setDoc(preguntasDoc1,{
      creadoPor: this._auth.actualUser.email.toUpperCase(),//_paciente.creadoPor.toUpperCase(),
      idPaciente: _Idpaciente,
      calificacion: evaluacion.calificacion,
      fecha_ini: evaluacion.fecha_ini.getTime(),
      fecha_fin: evaluacion.fecha_fin.getTime(),
      contestadas: evaluacion.contestadas,
      preguntas: evaluacion.preguntas,
      respuestas: evaluacion.respuestas,
      respuestaOk: evaluacion.respuestasOk,
      finalizado: evaluacion.finalizado
    }).then(val=>{
      this.evaluaciones=[];//para iniciar evaluaciones
      //console.log('Exito en la grabacion de Evaluacion con pacientes',val);
    }).catch((error)=>{
      console.log("Error en cargar Evaluación Pacientes ",error);
    });

    
  }
}
