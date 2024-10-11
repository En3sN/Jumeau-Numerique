import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';
import { ToastComponent } from 'src/app/Shared/toast/toast.component'; 
@Component({
  selector: 'app-mes-informations-personnelles',
  templateUrl: './mes-informations-personnelles.component.html',
  styleUrls: ['./mes-informations-personnelles.component.css']
})
export class MesInformationsPersonnellesComponent implements OnInit, AfterViewInit {
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  currentPasswordFieldType: string = 'password';
  newPasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

  utilisateur: any = {
    nom: '',
    pseudo: '',
    email: '',
    statut: '',
    organisation_nom: '',
    tel: '',
    adresse: '',
    cp: '',
    commune: ''
  };

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  statuts: string[] = [];

  passwordMatch: boolean = true; 
  passwordTyped: boolean = false;  

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.utilisateurService.fetchUtilisateurInfo().subscribe(data => {
      this.utilisateur = data;
      this.loadStatuts();
    });
  }

  ngAfterViewInit(): void {
    if (!this.toastComponent) {
      console.error('ToastComponent is not initialized');
    }
  }

  loadStatuts(): void {
    this.utilisateurService.getStatuts().subscribe((statuts: string[]) => {
      this.statuts = statuts;
      if (!this.utilisateur.statut) {
        this.utilisateur.statut = this.statuts[0];
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    switch(field) {
      case 'current':
        this.currentPasswordFieldType = this.currentPasswordFieldType === 'password' ? 'text' : 'password';
        break;
      case 'new':
        this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
        break;
      case 'confirm':
        this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
        break;
    }
  }

  checkPasswordMatch(): void {
    this.passwordTyped = true;
    this.passwordMatch = this.newPassword === this.confirmPassword;
  }

  savePassword(): void {
    this.checkPasswordMatch();

    if (!this.passwordMatch) {
      this.showToast('Les nouveaux mots de passe ne correspondent pas', 'danger');
      return;
    }

    this.utilisateurService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Mot de passe changé avec succès',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        }
        this.closePasswordModal();
      },
      error: (err) => {
        console.error('Error changing password:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors du changement de mot de passe',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      }
    });
  }

  closePasswordModal(): void {
    const passwordModal = bootstrap.Modal.getInstance(document.getElementById('DlgMajPWD') as HTMLElement);
    passwordModal?.hide();
  }

  changePassword(): void {
    const passwordModal = new bootstrap.Modal(document.getElementById('DlgMajPWD') as HTMLElement);
    passwordModal.show();
  }

  saveUserInfo(): void {
    const updateData = { ...this.utilisateur };
    delete updateData.id;

    this.utilisateurService.updateUtilisateurInfo(updateData).subscribe(response => {
      if (this.toastComponent) {
        this.toastComponent.showToast({
          title: 'Succès',
          message: 'Informations mises à jour avec succès',
          toastClass: 'bg-light',
          headerClass: 'bg-success',
          duration: 5000
        });
      }
    }, error => {
      console.error('Error updating user info');
      if (this.toastComponent) {
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Erreur de mise à jour des informations',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
    });
  }

  showToast(message: string, type: 'success' | 'danger'): void {
    if (this.toastComponent) {
      this.toastComponent.showToast({
        title: type === 'success' ? 'Succès' : 'Erreur',
        message: message,
        toastClass: 'bg-light',
        headerClass: type === 'success' ? 'bg-success' : 'bg-danger',
        duration: 5000
      });
    }
  }
}