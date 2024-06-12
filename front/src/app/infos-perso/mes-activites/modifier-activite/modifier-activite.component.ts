import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-modifier-activite',
  templateUrl: './modifier-activite.component.html',
  styleUrls: ['./modifier-activite.component.css']
})
export class ModifierActiviteComponent {

  constructor( private router: Router) {}

  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }

}
