import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/Services.service';

@Component({
  selector: 'app-details-service',
  templateUrl: './details-service.component.html',
  styleUrls: ['./details-service.component.css']
})
export class DetailsServiceComponent implements OnInit {
  service: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicesService.getServiceByActiviteId(+id).subscribe({
        next: (service: any) => {
          this.service = service;
        },
        error: (err: any) => {
          console.error('Error fetching service details:', err);
        }
      });
    }
  }

  back() {
    this.router.navigate(['/details-activite', this.service.activite_id]);
  }
}
