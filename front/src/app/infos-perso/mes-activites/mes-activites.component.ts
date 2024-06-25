import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';
import { ActiviteService } from 'src/app/Services/Activite.service';

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
  userActivities: any[] = [];
  activityToDelete: number | null = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurInfo();
    this.loadUserActivities();
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

  loadUserActivities(): void {
    this.activiteService.getUserActivities().subscribe(activities => {
      this.userActivities = activities;
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
      error: (err: any) => {
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
      this.activiteService.supprimerActivite(this.activityToDelete).subscribe({
        next: () => {
          this.userActivities = this.userActivities.filter(activity => activity.id !== this.activityToDelete);
          this.activityToDelete = null;
          const modalElement = document.getElementById('confirmationModal') as HTMLElement;
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        },
        error: (err: any) => {
          console.error('Error deleting activity:', err);
        }
      });
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/details-activite']);
  }
}