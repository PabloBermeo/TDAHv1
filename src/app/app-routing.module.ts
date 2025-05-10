import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AuthDesarrolador, AuthGuard, AuthSuperUser}from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
//import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { FotosComponent } from './components/fotos/fotos.component';
import { CargaComponent } from './components/carga/carga.component';
import { EvaluacionComponent } from './pages/evaluacion/evaluacion.component';
import { RestActualComponent } from './pages/rest-actual/rest-actual.component';
import { ReporteComponent } from './pages/reporte/reporte.component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { CrearUsersComponent } from './pages/crear-users/crear-users.component';
import { CrearOneUserComponent } from './pages/crear-one-user/crear-one-user.component';
import { DelOneUserComponent } from './pages/del-one-user/del-one-user.component';

const routes: Routes = [
  
  { path: 'home'    , component: HomeComponent, canActivate:[AuthGuard] },
  { path: 'fotos'   , component: FotosComponent, canActivate:[AuthGuard,AuthDesarrolador] },
  { path: 'carga'   , component: CargaComponent, canActivate:[AuthGuard,AuthDesarrolador] },
  //{ path: 'evaluacion/:idPaciente', component: EvaluacionComponent, canActivate:[AuthGuard] },
  { path: 'evaluar/:idPaciente/:timeIni', component: EvaluacionComponent, canActivate:[AuthGuard] },
  { path: 'paciente', component: PacienteComponent, canActivate:[AuthGuard] },
  //{ path: 'paciente', component: PacienteComponent },
  { path: 'pacientes', component: PacientesComponent, canActivate:[AuthGuard,AuthSuperUser] },
  // { path: 'resultadoActual', component: RestActualComponent, canActivate:[AuthGuard] },
  { path: 'crearUsers', component: CrearUsersComponent,canActivate:[AuthGuard,AuthSuperUser] },
  { path: 'crearOneUser', component: CrearOneUserComponent,canActivate:[AuthGuard,AuthSuperUser] },
  { path: 'delOneUser', component: DelOneUserComponent,canActivate:[AuthGuard,AuthSuperUser] },
  // { path: 'registro', component: RegistroComponent ,canActivate:[AuthGuard]},
  { path: 'login'   , component: LoginComponent },
  { path: 'reporte'   , component: ReporteComponent, canActivate:[AuthGuard,AuthSuperUser] },
  { path: '**',redirectTo: 'login' }//*/
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }//*/
