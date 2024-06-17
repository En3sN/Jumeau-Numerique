import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';

@Component({
  selector: 'app-mes-informations-personnelles',
  templateUrl: './mes-informations-personnelles.component.html',
  styleUrls: ['./mes-informations-personnelles.component.css']
})
export class MesInformationsPersonnellesComponent implements OnInit {
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

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.utilisateurService.fetchUtilisateurInfo().subscribe(data => {
      this.utilisateur = data;
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

  savePassword(): void {

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
      console.log('User info updated successfully:', response);
      alert('Informations mises à jour avec succès');
    }, error => {
      console.error('Error updating user info:', error);
    });
  }
}
