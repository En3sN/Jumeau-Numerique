import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './Services/Auth.service';
import { fadeAnimation } from './animations';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

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
      this.router.navigate(['/accueil']);
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        const currentUrl = this.router.url;
        const allowedWithoutLogin = ['/activites', '/inscription', '/accueil','/contacts', '/aide', 'services-associes'];

        if (!isLoggedIn && !allowedWithoutLogin.includes(currentUrl)) {
          this.router.navigate(['/accueil']);
        }
      });
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
