import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
// ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
 router=inject(Router);
  constructor(private auth:AuthService,
           ){}
  canActivate(): boolean {
    
    if(this.auth.estaAutenticado()){
      return true;
    }else{
      this.router.navigateByUrl('/login');
      return false;
    }
  }
  
}
///////Autorización Super Usuario
@Injectable({
  providedIn: 'root'
})
export class AuthSuperUser  {
  router=inject(Router);
  constructor(private auth:AuthService){}
  canActivate(): boolean {
    //console.log('Esta en auth.guard.ts->AuthDocente, esDocente:',this.auth.esDocente());
    if(this.auth.nivelUsuario()>=2){
      return true;
    }else{
      this.router.navigateByUrl('/home');
      return false;
    }
  }
  
}
///////Autorización Super Usuario
@Injectable({
  providedIn: 'root'
})
export class AuthDesarrolador  {
  router=inject(Router);
  constructor(private auth:AuthService){}
  canActivate(): boolean {
    //console.log('Esta en auth.guard.ts->AuthDocente, esDocente:',this.auth.esDocente());
    if(this.auth.nivelUsuario()>=3){
      return true;
    }else{
      this.router.navigateByUrl('/home');
      return false;
    }
  }
  
}
