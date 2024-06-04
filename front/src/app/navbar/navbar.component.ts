import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/Auth.service';
import { UtilisateurService } from '../Services/Utilisateur.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn();
  utilisateurInfo$: Observable<any> = this.utilisateurService.getUtilisateurInfo();

  constructor(
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.utilisateurService.fetchUtilisateurInfo().subscribe();
      }
    });
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
    this.utilisateurService.clearUtilisateurInfo();
  }
}
