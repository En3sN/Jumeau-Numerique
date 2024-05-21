import { Component } from '@angular/core';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  newPasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

  togglePasswordVisibility(field: string): void {
    if (field === 'new') {
      this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirm') {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  saveInscription(): void {
    // Logique pour enregistrer les informations d'inscription
  }
}
