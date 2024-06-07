import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../Services/Utilisateur.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  newPasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  inscriptionForm: FormGroup;

  constructor(private fb: FormBuilder, private utilisateurService: UtilisateurService, private router: Router) {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      pseudo: [''],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      tel: [''],
      pwd: ['', [Validators.required, Validators.minLength(6)]],
      confirmPwd: ['', Validators.required],
      adresse: [''],
      cp: [''],
      commune: [''],
      roles: [''],
      statut: ['Particulier', Validators.required],
      organisation: [null]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('pwd')?.value;
    const confirmPassword = form.get('confirmPwd')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPwd')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPwd')?.setErrors(null);
    }
  }

  saveInscription(): void {
    if (this.inscriptionForm.valid) {
      const formValue = {
        ...this.inscriptionForm.value,
        roles: this.inscriptionForm.value.roles.split(',').map((role: string) => role.trim()),
        organisation: parseInt(this.inscriptionForm.value.organisation, 10) || null
      };

      delete formValue.confirmPwd;

      this.utilisateurService.inscrireUtilisateur(formValue).subscribe(response => {
        console.log('Inscription réussie');
        this.router.navigate(['/accueil']);
      }, error => {
        console.error('Erreur lors de l\'inscription', error);
      });
    } else {
      console.log('Formulaire invalide');
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'new') {
      this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirm') {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }
}
