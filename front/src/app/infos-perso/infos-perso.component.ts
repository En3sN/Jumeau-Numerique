import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-infos-perso',
  templateUrl: './infos-perso.component.html',
  styleUrls: ['./infos-perso.component.css']
})
export class InfosPersoComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab) {
        const element = document.getElementById(`pills-${tab}-tab`);
        if (element) {
          element.click();
        }
      }
    });
  }
}
