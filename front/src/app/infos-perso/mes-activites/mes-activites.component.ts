import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';

@Component({
  selector: 'app-mes-activites',
  templateUrl: './mes-activites.component.html',
  styleUrls: ['./mes-activites.component.css']
})
export class MesActivitesComponent implements OnInit {
  showConfirmationToast: boolean = false;
  hasPermission: boolean = false;

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.utilisateurService.getUserRoles().subscribe(roles => {
      if (roles && Array.isArray(roles)) {
        this.hasPermission = roles.includes('Activite') || roles.includes('Admin');
      }
    });
  }

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

  saveModal(): void {
    this.showConfirmationToast = true;
    setTimeout(() => this.showConfirmationToast = false, 4000); 
    this.closeModal();
  }

  closeConfirmationToast(): void {
    this.showConfirmationToast = false;
  }

  editActivite(id: number): void {
    this.router.navigate(['/modifier-activite', id]);
  }

  viewDetails() {
    this.router.navigate(['/details-activite']);
  }
}
