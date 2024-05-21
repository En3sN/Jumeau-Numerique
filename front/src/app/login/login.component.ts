import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  passwordFieldType: string = 'password';

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  login(): void {
    // Logique de connexion
  }

  signup(): void {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('DlgLogin') as HTMLElement);
    loginModal?.hide();

    this.router.navigate(['/inscription']);
  }
}
