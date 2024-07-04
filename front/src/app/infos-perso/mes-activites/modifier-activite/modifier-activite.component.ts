import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';

@Component({
  selector: 'app-modifier-activite',
  templateUrl: './modifier-activite.component.html',
  styleUrls: ['./modifier-activite.component.css']
})
export class ModifierActiviteComponent implements OnInit {
  activiteId!: number;
  activiteData: any = {};
  newTag: string = '';
  userInfosKeys: string[] = [];
  prerequisKeys: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private activiteService: ActiviteService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.activiteId = +params.get('id')!;
      this.loadActivite();
    });
  }

  loadActivite(): void {
    this.activiteService.getActiviteById(this.activiteId).subscribe({
      next: (data) => {
        this.activiteData = data;
        this.activiteData.user_infos = this.ensureJsonParsed(this.activiteData.user_infos);
        this.activiteData.prerequis = this.ensureJsonParsed(this.activiteData.prerequis);
        this.userInfosKeys = Object.keys(this.activiteData.user_infos);
        this.prerequisKeys = Object.keys(this.activiteData.prerequis);
      },
      error: (err) => {
        console.error('Error fetching activity details:', err);
      }
    });
  }

  ensureJsonParsed(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return {};
      }
    }
    return data || {};
  }

  updateActivite(): void {
    try {
      this.activiteData.user_infos = this.rebuildObject(this.userInfosKeys, this.activiteData.user_infos);
      this.activiteData.prerequis = this.rebuildObject(this.prerequisKeys, this.activiteData.prerequis);

      const updateData = { 
        ...this.activiteData, 
        user_infos: JSON.stringify(this.activiteData.user_infos), 
        prerequis: JSON.stringify(this.activiteData.prerequis) 
      };
      delete updateData.id; 
      delete updateData.organisation_nom;

      this.activiteService.updateActivite(this.activiteId, updateData).subscribe({
        next: (response) => {
          console.log('Activity updated successfully:');
          this.toastService.showToast('Succès', 'Mise à jour des données réussie', 'toast', 'bg-info text-white');
        },
        error: (err) => {
          console.error('Error updating activity:', err);
        }
      });
    } catch (e) {
      console.error('Error preparing data for update:', e);
      this.toastService.showToast('Erreur', 'Une erreur est survenue lors de la mise à jour des données', 'toast', 'bg-danger text-white');
    }
  }

  rebuildObject(keys: string[], data: any): any {
    const newObj: any = {};
    keys.forEach(key => {
      newObj[key] = data[key];
    });
    return newObj;
  }

  addUserInfoKey() {
    this.userInfosKeys.push('');
  }

  removeUserInfoKey(index: number) {
    const key = this.userInfosKeys[index];
    delete this.activiteData.user_infos[key];
    this.userInfosKeys.splice(index, 1);
  }

  addPrerequisKey() {
    this.prerequisKeys.push('');
  }

  removePrerequisKey(index: number) {
    const key = this.prerequisKeys[index];
    delete this.activiteData.prerequis[key];
    this.prerequisKeys.splice(index, 1);
  }

  addTag() {
    if (this.newTag) {
      this.activiteData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.activiteData.tags.splice(index, 1);
  }

  saveTags() {
    const updateData = { tags: this.activiteData.tags };
    this.activiteService.updateActivite(this.activiteId, updateData).subscribe({
      next: (response) => {
        console.log('Tags updated successfully:');
        this.toastService.showToast('Succès', 'Mise à jour des tags réussie', 'toast', 'bg-info text-white');
      },
      error: (err) => {
        console.error('Error updating tags:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }
}
