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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MesInformationsPersonnellesComponent } from './infos-perso/mes-informations-personnelles/mes-informations-personnelles.component';
import { MesInformationsComplementairesComponent } from './infos-perso/mes-informations-complementaires/mes-informations-complementaires.component';
import { MesCompetencesComponent } from './infos-perso/mes-competences/mes-competences.component';
import { MesAbonnementsComponent } from './infos-perso/mes-abonnements/mes-abonnements.component';
import { MesActivitesComponent } from './infos-perso/mes-activites/mes-activites.component';
import { MonOrganisationComponent } from './infos-perso/mon-organisation/mon-organisation.component';
import { MonPlanningComponent } from './infos-perso/mon-planning/mon-planning.component';
import { AuthService } from './Services/auth.service';
import { CookieService } from 'ngx-cookie-service';

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
    MonPlanningComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [AuthService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
