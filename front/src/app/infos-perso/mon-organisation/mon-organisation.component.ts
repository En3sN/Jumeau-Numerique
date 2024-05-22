import { Component } from '@angular/core';

@Component({
  selector: 'app-mon-organisation',
  templateUrl: './mon-organisation.component.html',
  styleUrls: ['./mon-organisation.component.css']
})
export class MonOrganisationComponent {

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;
      
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validImageTypes.includes(fileType)) {
        alert('Seuls les fichiers .png, .jpeg, .jpg sont acceptés.');
        input.value = ''; // Clear the input if the file type is not valid
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        const output = document.getElementById('logoPreview') as HTMLImageElement;
        output.src = dataURL;
      };
      reader.readAsDataURL(file);
    }
  }

  DlgUserInfoSave(): void {
    // Logique pour enregistrer les informations utilisateur
  }
}
