import { BrowserModule } from '@angular/platform-browser';
import { inject, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import {FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';

import {provideHttpClient } from '@angular/common/http';
import { FotosComponent } from './components/fotos/fotos.component';
import { CargaComponent } from './components/carga/carga.component';
import { environment } from '../environments/environment';
import { NgDropFilesDirective } from './directives/ng-drop-files.directive';
import { NavbarComponent } from './components/navbar/navbar.component';
import { EvaluacionComponent } from './pages/evaluacion/evaluacion.component';
import { PreguntaComponent } from './components/pregunta/pregunta.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { ResultadosComponent } from './components/resultados/resultados.component';
import { TimerComponent } from './components/timer/timer.component';
import { RestActualComponent } from './pages/rest-actual/rest-actual.component';
import { ReporteComponent } from './pages/reporte/reporte.component';



//Firestore y Firebase
import { provideFirestore, getFirestore, enableIndexedDbPersistence} from '@angular/fire/firestore';
import{provideStorage,getStorage}from '@angular/fire/storage';

import { provideFirebaseApp,initializeApp, FirebaseAppModule, FirebaseApp } from '@angular/fire/app';

import { PacienteComponent } from './pages/paciente/paciente.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { CrearUsersComponent } from './pages/crear-users/crear-users.component';
import { CrearOneUserComponent } from './pages/crear-one-user/crear-one-user.component';
import { DelOneUserComponent } from './pages/del-one-user/del-one-user.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CargaImagenesService } from './services/carga-imagenes.service';
//import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
@NgModule({
  declarations: [
    TimerComponent,
    AppComponent,
    RegistroComponent,
    HomeComponent,
    LoginComponent,
    FotosComponent,
    CargaComponent,
    NgDropFilesDirective,
    NavbarComponent,
    EvaluacionComponent,
    PreguntaComponent,
    EstadisticasComponent,
    ResultadosComponent,
    RestActualComponent,
    ReporteComponent,
    PacienteComponent,
    PacientesComponent,
    CrearUsersComponent,
    CrearOneUserComponent,
    DelOneUserComponent,
  
   // TimerComponent
  ],
  exports:[RouterModule],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FirebaseAppModule
    
  ],
  providers: [
    provideHttpClient(),
    provideFirebaseApp(()=>initializeApp(environment.firebase)),
    provideFirestore(()=>getFirestore(inject(FirebaseApp),'apptdah-2025')),
    provideStorage(()=>getStorage()),//*/
    AuthService,
    CargaImagenesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
