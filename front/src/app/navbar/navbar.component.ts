import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../Services/Auth.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  showLoginModal(): void {
    const loginModal = new bootstrap.Modal(document.getElementById('DlgLogin') as HTMLElement);
    loginModal.show();
  }
  goToMyInfos(): void {
    this.router.navigate(['/infos-perso']);
  }

  logout(): void {
    this.authService.logout();
   // this.router.navigate(['/accueil']);
  }
}
