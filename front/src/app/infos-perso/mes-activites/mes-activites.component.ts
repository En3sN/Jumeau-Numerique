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
  userRoles: string[] = [];
  userId: number | null = null;
  activityToDelete: number | null = null;

  constructor(
    private utilisateurService: UtilisateurService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurInfo();
  }

  loadUtilisateurInfo(): void {
    this.utilisateurService.getUtilisateurInfo().subscribe(user => {
      this.userId = user.id; 
      this.userRoles = user.roles || [];
      this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
    });

    this.utilisateurService.getUserRoles().subscribe(roles => {
      this.userRoles = roles;
      this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
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
    if (this.userId === null) {
      console.error('User ID is null');
      return;
    }
    const roles = ['Activite'].filter(role => role && role.trim());
    this.utilisateurService.addRoleToUser(this.userId, roles).subscribe({
      next: (response) => {
        this.userRoles = response.roles || [];
        this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
        this.showConfirmationToast = true;
        this.loadUtilisateurInfo(); 
        this.closeModal(); 
        setTimeout(() => this.showConfirmationToast = false, 4000);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  closeConfirmationToast(): void {
    this.showConfirmationToast = false;
  }

  editActivite(id: number, event: MouseEvent): void {
    event.stopPropagation(); 
    this.router.navigate(['/modifier-activite', id]);
  }

  deleteActivite(id: number, event: MouseEvent): void {
    event.stopPropagation(); 
    this.activityToDelete = id;
    const modalElement = document.getElementById('confirmationModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  confirmDelete(): void {
    if (this.activityToDelete !== null) {
      this.activityToDelete = null;
      const modalElement = document.getElementById('confirmationModal') as HTMLElement;
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  viewDetails(): void {
    this.router.navigate(['/details-activite']);
  }
}
