import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/Services.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';

@Component({
  selector: 'app-modifier-service',
  templateUrl: './modifier-service.component.html',
  styleUrls: ['./modifier-service.component.css']
})
export class ModifierServiceComponent implements OnInit {
  serviceId!: number;
  serviceData: any = { tags: [] };
  newTag: string = '';
  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private servicesService: ServicesService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.serviceId = +params.get('id')!;
      this.loadService();
    });
  }

  loadService(): void {
    this.servicesService.findOne(this.serviceId).subscribe({
      next: (data: any) => {
        this.serviceData = data;
        this.loadLogo();
      },
      error: (err: any) => {
        console.error('Error fetching service details:', err);
      }
    });
  }

  loadLogo(): void {
    this.servicesService.getLogo(this.serviceId).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.serviceData.logoUrl = event.target.result;
        };
        reader.readAsDataURL(blob);
      },
      error: (err: any) => {
        console.error('Error loading logo:', err);
        this.serviceData.logoUrl = null;
      }
    });
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.serviceData.logoUrl = null;
  }

  updateService(): void {
    const tagsArray = Array.isArray(this.serviceData.tags) ? this.serviceData.tags : [];
    const isPackBoolean = this.serviceData.is_pack === true || this.serviceData.is_pack === 'true';

    const updateData = {
      nom: this.serviceData.nom,
      description: this.serviceData.description,
      reference: this.serviceData.reference,
      type: this.serviceData.type,
      tags: tagsArray,
      is_pack: isPackBoolean,
      validation: Boolean(this.serviceData.validation),
      template: this.serviceData.template,
    };

    this.servicesService.updateService(this.serviceId, updateData).subscribe({
      next: (response: any) => {
        if (this.logoFile) {
          this.servicesService.updateLogo(this.serviceId, this.logoFile).subscribe({
            next: () => {
              this.toastService.showToast('Succès', 'Service et logo mis à jour avec succès', 'toast', 'bg-info text-white');
              this.loadLogo();
            },
            error: (err: any) => {
              console.error('Error updating logo:', err);
            }
          });
        } else {
          this.toastService.showToast('Succès', 'Service mis à jour avec succès', 'toast', 'bg-info text-white');
        }
      },
      error: (err: any) => {
        console.error('Error updating service:', err);
      }
    });
  }

  addTag() {
    if (this.newTag) {
      this.serviceData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.serviceData.tags.splice(index, 1);
  }

  back() {
    this.router.navigate(['/details-activite', this.serviceData.activite_id], { queryParams: { tab: 'services' } });
  }
}
