import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InfosPersoComponent } from './infos-perso/infos-perso.component'; 
import { InscriptionComponent } from './inscription/inscription.component';

const routes: Routes = [
  { path: '', redirectTo: '/tableau-de-bord', pathMatch: 'full' }, 
  { path: 'tableau-de-bord', component: DashboardComponent },
  { path: 'infos-perso', component: InfosPersoComponent },
  { path: 'inscription', component: InscriptionComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
