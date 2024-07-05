import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './Services/Auth.service';
import { filter } from 'rxjs';
import { fadeAnimation } from './animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [fadeAnimation]
})
export class AppComponent {
  title = 'front';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.onLogout.subscribe(() => {
      const currentUrl = this.router.url;
      const protectedRoutes = ['/infos-perso', '/planning', '/infos-perso', '/modifier-activite', '/details-activite', '/details-service'];

      if (protectedRoutes.includes(currentUrl)) {
        this.router.navigate(['/accueil']);
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.authService.checkLoginStatus().subscribe();
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
