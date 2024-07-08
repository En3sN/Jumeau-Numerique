// details-service.component.ts
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
  serviceId!: number;
  logoUrl: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.serviceId = +params.get('id')!;
      this.loadService();
    });
  }

  loadService(): void {
    this.servicesService.getServiceByActiviteId(this.serviceId).subscribe({
      next: (data) => {
        this.service = data;
        this.loadLogo();
      },
      error: (err) => {
        console.error('Error fetching service details:', err);
      }
    });
  }

  loadLogo(): void {
    this.servicesService.getLogo(this.serviceId).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.logoUrl = event.target.result;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error loading logo:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/details-activite', this.service.activite_id]);
  }
}
