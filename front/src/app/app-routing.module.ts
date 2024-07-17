import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfosPersoComponent } from './infos-perso/infos-perso.component'; 
import { InscriptionComponent } from './inscription/inscription.component';
import { AccueilComponent } from './accueil/accueil.component';
import { PlanningComponent } from './planning/planning.component';
import { AideComponent } from './aide/aide.component';
import { ContactsComponent } from './contacts/contacts.component';
import { ActivitesComponent } from './activites/activites.component';
import { AuthGuard } from './Services/Auth-guard.service';
import { ModifierActiviteComponent } from './infos-perso/mes-activites/modifier-activite/modifier-activite.component';
import { DetailsActiviteComponent } from './infos-perso/mes-activites/details-activite/details-activite.component';
import { MesAbonnementsComponent } from './mes-abonnements/mes-abonnements.component';
import { DetailsServiceComponent } from './infos-perso/mes-activites/details-service/details-service.component';
import { ModifierServiceComponent } from './infos-perso/mes-activites/modifier-service/modifier-service.component';

const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full', data: { animation: 'HomePage' } },
  { path: 'accueil', component: AccueilComponent, data: { animation: 'HomePage' } },
  { path: 'abonnements', component: MesAbonnementsComponent, canActivate: [AuthGuard], data: { animation: 'AbonnementsPage' } },
  { path: 'infos-perso', component: InfosPersoComponent, canActivate: [AuthGuard], data: { animation: 'InfosPersoPage' } },
  { path: 'inscription', component: InscriptionComponent, data: { animation: 'InscriptionPage' } },
  { path: 'planning', component: PlanningComponent, canActivate: [AuthGuard], data: { animation: 'PlanningPage' } },
  { path: 'aide', component: AideComponent, data: { animation: 'AidePage' } },
  { path: 'contacts', component: ContactsComponent, data: { animation: 'ContactsPage' } },
  { path: 'activites', component: ActivitesComponent, data: { animation: 'ActivitesPage' } },
  { path: 'modifier-activite/:id', component: ModifierActiviteComponent, canActivate: [AuthGuard], data: { animation: 'ModifierActivitePage' }},
  { path: 'details-activite/:id', component: DetailsActiviteComponent, canActivate: [AuthGuard], data: { animation: 'DetailsActivitePage' }},
  { path: 'details-service/:id', component: DetailsServiceComponent, canActivate: [AuthGuard], data: { animation: 'DetailsServicePage' }},
  { path: 'modifier-service/:id', component: ModifierServiceComponent, canActivate: [AuthGuard], data: { animation: 'ModifierServicePage' } },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }