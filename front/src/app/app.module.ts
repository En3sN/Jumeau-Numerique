import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
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
import { MesAbonnementsComponent } from './infos-perso/mes-abonnements/mes-abonnements.component';
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [AuthService, CookieService,{ provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
