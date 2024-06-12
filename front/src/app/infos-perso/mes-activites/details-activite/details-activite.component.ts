import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details-activite',
  templateUrl: './details-activite.component.html',
  styleUrls: ['./details-activite.component.css']
})
export class DetailsActiviteComponent {

  constructor( private router: Router) {}
  
  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }
}
