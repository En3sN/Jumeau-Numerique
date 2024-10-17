import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './Auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {
            const allowedWithoutLogin = ['/activites', '/inscription', '/accueil', '/contacts', '/aide','/services-associes/:id'];

        return this.authService.isLoggedIn().pipe(
            map(isLoggedIn => {
                if (!isLoggedIn && !allowedWithoutLogin.includes(state.url)) {
                    this.router.navigate(['/accueil']);
                    return false;
                }
                return true;
            })
        );
    }
}