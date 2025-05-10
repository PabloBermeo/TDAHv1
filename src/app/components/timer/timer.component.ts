import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
//import * as countdown from 'countdown';
//import countdown from 'countdown';
//import { Timestamp, timestamp } from 'rxjs';



interface Time1{
  hours:number;
  minutes:number,
  seconds:number
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})

export class TimerComponent implements OnInit {
 @Input() npreguntas:number;
 @Output() finaliza_T:EventEmitter<boolean>=new EventEmitter();
  time:Time1;
	timerId:any;//:number|countdown.Timespan;
  clase:string=null;
  clase1="btn btn-outline-primary";
  clase2="btn btn-danger";
  tiempo_prueba:number=0;
  //npreguntas=10;
  constructor() { 
  }
 fin_t(){
   this.finaliza_T.emit(true);
 }
 actualizarTime(){
  const horas=Math.floor(this.tiempo_prueba/3600);
  this.time={
    hours:horas,
    minutes:Math.floor(this.tiempo_prueba/60)-horas,
    seconds:this.tiempo_prueba%60
  };
 }
  ngOnInit() {
    let t_pregunta=90;//es el tiempo por pregunta
     let date=new Date();
     this.tiempo_prueba=this.npreguntas*t_pregunta+120;  
     this.actualizarTime();
    this.clase=this.clase1;
    date.setSeconds(this.tiempo_prueba);
    //*********************** */
    this.timerId=setInterval(()=>{
      if(this.tiempo_prueba>0){
        this.tiempo_prueba--;
        this.actualizarTime();
        if(this.tiempo_prueba < 5*60){
          this.clase=this.clase2;
        }
      }else{
        this.fin_t();
        //clearInterval(this.timerId);
      }
    },1000);
    return;
    /*this.timerId=countdown(date,(ts)=>{
      //this.time=ts;
      this.time={
        hours:ts.hours,
        minutes:ts.minutes,
        seconds:ts.seconds
      };
     // console.log(ts.toString());
     // console.log(ts);
      console.log('time',this.time.seconds);
     if((this.time.hours===0)&&(this.time.minutes) < 5){
       this.clase=this.clase2;
     }
     if((this.time.hours===0)&&(this.time.minutes===0)&&(this.time.seconds<1)){
      this.fin_t();
     }
      }, countdown.HOURS | countdown.MINUTES | countdown.SECONDS
    );//*/
    
  }
  
  ngOnDestroy(){
		if(this.timerId){
			clearInterval(this.timerId as number);
		}
	}

}
