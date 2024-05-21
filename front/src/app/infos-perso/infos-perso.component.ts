import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-infos-perso',
  templateUrl: './infos-perso.component.html',
  styleUrls: ['./infos-perso.component.css']
})
export class InfosPersoComponent {
  currentPasswordFieldType: string = 'password';
  newPasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

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

  savePassword(): void {
    // Logique pour enregistrer le mot de passe
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
    // Logique pour enregistrer les informations utilisateur
  }
}
