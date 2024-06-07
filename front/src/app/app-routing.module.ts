import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InfosPersoComponent } from './infos-perso/infos-perso.component'; 
import { InscriptionComponent } from './inscription/inscription.component';
import { AccueilComponent } from './accueil/accueil.component';
import { PlanningComponent } from './planning/planning.component';
import { AideComponent } from './aide/aide.component';
import { ContactsComponent } from './contacts/contacts.component';
import { ActivitesComponent } from './activites/activites.component';
import { AuthGuard } from './Services/Auth-guard.service';


const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' }, 
  { path: 'accueil', component: AccueilComponent },
  { path: 'tableau-de-bord', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'infos-perso', component: InfosPersoComponent, canActivate: [AuthGuard] },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'planning', component: PlanningComponent, canActivate: [AuthGuard] },
  { path: 'aide', component: AideComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'activites', component: ActivitesComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
