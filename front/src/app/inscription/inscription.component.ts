import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../Services/Utilisateur.service';
import { ToastComponent } from 'src/app/Shared/toast/toast.component'; 
import * as bootstrap from 'bootstrap'; 

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit, AfterViewInit {
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  newPasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  inscriptionForm: FormGroup;
  emailInUse: boolean = false;
  statuts: string[] = [];

  constructor(private fb: FormBuilder, private utilisateurService: UtilisateurService, private router: Router) {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      pseudo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      tel: [''],
      pwd: ['', [Validators.required, Validators.minLength(6)]],
      confirmPwd: ['', Validators.required],
      adresse: [''],
      cp: [''],
      commune: [''],
      roles: [''],
      statut: ['Particulier', Validators.required],
      organisation_nom: ['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadStatuts();
  }

  ngAfterViewInit(): void {
    if (!this.toastComponent) {
      console.error('ToastComponent is not initialized');
    }
  }

  loadStatuts(): void {
    this.utilisateurService.getStatuts().subscribe((statuts: string[]) => {
      this.statuts = statuts;
    });
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
        organisation_nom: this.inscriptionForm.value.organisation_nom
      };

      delete formValue.confirmPwd;

      this.utilisateurService.inscrireUtilisateur(formValue).subscribe(response => {
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Inscription réussie',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        }
        this.router.navigate(['/login']);
      }, error => {
        if (error.status === 409) {
          this.emailInUse = true;
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Email déjà utilisé',
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
        } else {
          console.error('Erreur lors de l\'inscription', error);
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de l\'inscription',
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
        }
      });
    } else {
      if (this.toastComponent) {
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Formulaire invalide',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
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