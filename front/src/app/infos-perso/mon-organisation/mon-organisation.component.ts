import { Component, OnInit } from '@angular/core';
import { OrganisationService } from 'src/app/Services/Organisation.service';

@Component({
  selector: 'app-mon-organisation',
  templateUrl: './mon-organisation.component.html',
  styleUrls: ['./mon-organisation.component.css']
})
export class MonOrganisationComponent implements OnInit {
  organisation: any = {};
  hasOrganisation: boolean = false;
  logoFile: File | null = null;

  constructor(private organisationService: OrganisationService) {}

  ngOnInit(): void {
    this.getOrganisation();
  }

  getOrganisation(): void {
    this.organisationService.getOrganisation().subscribe(
      (data) => {
        if (data) {
          this.organisation = data;
          this.hasOrganisation = true;
          if (this.organisation.logo) {
            this.loadLogo(this.organisation.logo);
          }
        } else {
          this.hasOrganisation = false;
        }
      },
      (error) => {
        console.error('Error fetching organisation data', error);
        this.hasOrganisation = false;
      }
    );
  }

  loadLogo(logoBuffer: ArrayBuffer): void {
    const blob = new Blob([logoBuffer], { type: 'image/png' });
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result as string;
      const output = document.getElementById('logoPreview') as HTMLImageElement;
      output.src = dataURL;
    };
    reader.readAsDataURL(blob);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;

      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validImageTypes.includes(fileType)) {
        alert('Seuls les fichiers .png, .jpeg, .jpg sont acceptés.');
        input.value = ''; 
        return;
      }

      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        const output = document.getElementById('logoPreview') as HTMLImageElement;
        output.src = dataURL;
        this.organisation.logo = dataURL;
      };
      reader.readAsDataURL(file);
    }
  }

  DlgUserInfoSave(): void {
    const formData = new FormData();
    Object.keys(this.organisation).forEach((key) => {
      if (key !== 'logo' && key !== 'id') { 
        formData.append(key, this.organisation[key]);
      }
    });

    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }

    if (this.hasOrganisation) {
      this.organisationService.updateOrganisation(this.organisation.id, formData).subscribe(
        (response) => {
          console.log('Organisation mise à jour avec succès:', response);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'organisation:', error);
        }
      );
    } else {
      this.organisationService.createOrganisation(formData).subscribe(
        (response) => {
          console.log('Organisation créée avec succès:', response);
          this.hasOrganisation = true;
          this.organisation.id = response.id;
        },
        (error) => {
          console.error('Erreur lors de la création de l\'organisation:', error);
        }
      );
    }
  }
}
