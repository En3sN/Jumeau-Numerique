import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showLoginModal(): void {
    const loginModal = new bootstrap.Modal(document.getElementById('DlgLogin') as HTMLElement);
    loginModal.show();
  }

  showUserInfo(): void {
  }
}
