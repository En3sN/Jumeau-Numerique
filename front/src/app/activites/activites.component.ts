import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../Services/Utilisateur.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.css']
})
export class ActivitesComponent{
  showConfirmationToast: boolean = false;


  constructor(
    private utilisateurService: UtilisateurService, 
    private router: Router
  ) {}


  openModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }



  viewDetails() {
    this.router.navigate(['/details-activite']);
  }
}
