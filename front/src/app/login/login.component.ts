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
  showSuccessToast: boolean = false; 
  showErrorToast: boolean = false; 

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
          this.showSuccessToast = true; 
          setTimeout(() => this.showSuccessToast = false, 4000); 
        }
      },
      error => {
        this.showErrorToast = true; 
        setTimeout(() => this.showErrorToast = false, 4000); 
        console.error('Login failed', error);
      }
    );
  }

  signup(): void {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('DlgLogin') as HTMLElement);
    loginModal?.hide();
    this.router.navigate(['/inscription']);
  }

  closeSuccessToast(): void {
    this.showSuccessToast = false;
  }

  closeErrorToast(): void {
    this.showErrorToast = false;
  }
}
