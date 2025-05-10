import { Component, OnInit } from '@angular/core';
import * as countdown from 'countdown';
@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
interface Time{
  horas:number;
  minutos:number,
  segundos:number
}
export class TimerComponent implements OnInit {
  time:Time=null;
	timerId:number=null;
  npreguntas=10;
  constructor() { }

  ngOnInit() {
    let date=new Date();
    
    date.setSeconds(this.npreguntas*60);
    this.timerId=countdown(date,(ts)=>{
      this.time=ts;
      console.log(ts);
      }, countdown.HOURS | countdown.MINUTES | countdown.SECONDS
    )
  }
  
  ngOnDestroy(){
		if(this.timerId){
			clearInterval(this.timerId);
		}
	}

}
