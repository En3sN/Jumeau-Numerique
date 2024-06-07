import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Services/Auth.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  pwd: string = '';
  passwordFieldType: string = 'password';
  showSuccessAlert: boolean = false; 
  showErrorAlert: boolean = false; 

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  login(): void {
    this.authService.login(this.email, this.pwd).subscribe(
      response => {
        if (response.message === 'Login successful') {
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('DlgLogin') as HTMLElement);
          loginModal?.hide();
          this.showSuccessAlert = true; 
          setTimeout(() => this.showSuccessAlert = false, 5000); 
        }
      },
      error => {
        this.showErrorAlert = true; 
        setTimeout(() => this.showErrorAlert = false, 5000); 
        console.error('Login failed', error);
      }
    );
  }
  signup(): void {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('DlgLogin') as HTMLElement);
    loginModal?.hide();
    this.router.navigate(['/inscription']);
  }

  closeSuccessAlert(): void {
    this.showSuccessAlert = false;
  }

  closeErrorAlert(): void {
    this.showErrorAlert = false;
  }
}
