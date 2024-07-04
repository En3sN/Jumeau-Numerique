import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { InfosPersoComponent } from './infos-perso/infos-perso.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MesInformationsPersonnellesComponent } from './infos-perso/mes-informations-personnelles/mes-informations-personnelles.component';
import { MesInformationsComplementairesComponent } from './infos-perso/mes-informations-complementaires/mes-informations-complementaires.component';
import { MesCompetencesComponent } from './infos-perso/mes-competences/mes-competences.component';
import { MesActivitesComponent } from './infos-perso/mes-activites/mes-activites.component';
import { MonOrganisationComponent } from './infos-perso/mon-organisation/mon-organisation.component';
import { MonPlanningComponent } from './infos-perso/mon-planning/mon-planning.component';
import { CookieService } from 'ngx-cookie-service';
import { CsrfInterceptor } from './Services/Csrf-Interceptor.service';
import { AuthService } from './Services/Auth.service';
import { PlanningComponent } from './planning/planning.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AideComponent } from './aide/aide.component';
import { ActivitesComponent } from './activites/activites.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModifierActiviteComponent } from './infos-perso/mes-activites/modifier-activite/modifier-activite.component';
import { DetailsActiviteComponent } from './infos-perso/mes-activites/details-activite/details-activite.component';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { CommonModule } from '@angular/common'; 
import { DashboardComponent } from './infos-perso/dashboard/dashboard.component';
import { MesAbonnementsComponent } from './mes-abonnements/mes-abonnements.component';
import { ToastComponent } from './Shared/toast/toast.component';
import { ToastService } from './Shared/Service/toast.service';
import { DetailsServiceComponent } from './infos-perso/mes-activites/details-service/details-service.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AccueilComponent,
    NavbarComponent,
    LoginComponent,
    InfosPersoComponent,
    InscriptionComponent,
    MesInformationsPersonnellesComponent,
    MesInformationsComplementairesComponent,
    MesCompetencesComponent,
    MesAbonnementsComponent,
    MesActivitesComponent,
    MonOrganisationComponent,
    MonPlanningComponent,
    PlanningComponent,
    ContactsComponent,
    AideComponent,
    ActivitesComponent,
    ModifierActiviteComponent,
    DetailsActiviteComponent,
    ToastComponent,
    DetailsServiceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FullCalendarModule 
  ],
  providers: [AuthService, CookieService,ToastService,{ provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
