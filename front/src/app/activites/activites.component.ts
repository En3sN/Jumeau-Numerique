import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../Services/Utilisateur.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ActiviteService } from '../Services/Activite.service';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { debounceTime, startWith, switchMap, map } from 'rxjs/operators';
import { FilesService } from '../Services/Files.service';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.css']
})
export class ActivitesComponent implements OnInit {
  showConfirmationToast: boolean = false;
  publicActivities$: Observable<any[]> = new Observable<any[]>();
  nomFilter = new FormControl('');
  typeFilter = new FormControl([]);
  domaineFilter = new FormControl([]);
  organisationNomFilter = new FormControl('');
  tagFilter = new FormControl('');
  statutFilter = new FormControl([]);
  selectedActivity: any = null;
  filters: any = {
    nom: '',
    type: [],
    domaine: [],
    organisation_nom: '',
    tag: '',
    statut: []
  };
  appliedFilters: any = [];

  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private filesService: FilesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.publicActivities$ = combineLatest([
      this.nomFilter.valueChanges.pipe(startWith(this.nomFilter.value)),
      this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)),
      this.domaineFilter.valueChanges.pipe(startWith(this.domaineFilter.value)),
      this.organisationNomFilter.valueChanges.pipe(startWith(this.organisationNomFilter.value)),
      this.tagFilter.valueChanges.pipe(startWith(this.tagFilter.value)),
      this.statutFilter.valueChanges.pipe(startWith(this.statutFilter.value))
    ]).pipe(
      debounceTime(300),
      switchMap(([nom, type, domaine, organisation_nom, tag, statut]) =>
        this.activiteService.getPublicActivities({
          nom,
          type,
          domaine,
          organisation_nom,
          tag,
          statut
        })
      ),
      map((activities: any[]) => {
        return activities.map(activity => {
          if (activity.logo) {
            this.activiteService.getLogo(activity.id).subscribe(logoBlob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                activity.logoUrl = e.target.result;
              };
              reader.readAsDataURL(logoBlob);
            });
          }
          return activity;
        });
      })
    );
  }

  onFilterChange(filterName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.type === 'checkbox') {
      if (target.checked) {
        if (!this.filters[filterName].includes(target.value)) {
          this.filters[filterName].push(target.value);
        }
      } else {
        this.filters[filterName] = this.filters[filterName].filter((value: string) => value !== target.value);
      }
    } else {
      this.filters[filterName] = target.value;
    }
    this.updateAppliedFilters();
    this.loadPublicActivities();
  }

  updateAppliedFilters() {
    this.appliedFilters = Object.entries(this.filters)
      .filter(([key, value]) => value && (Array.isArray(value) ? value.length : true))
      .map(([key, value]) => ({ key, value }));
  }

  loadPublicActivities(): void {
    this.publicActivities$ = this.activiteService.getPublicActivities(this.filters).pipe(
      map((activities: any[]) => {
        return activities.map(activity => {
          if (activity.logo) {
            this.activiteService.getLogo(activity.id).subscribe(logoBlob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                activity.logoUrl = e.target.result;
              };
              reader.readAsDataURL(logoBlob);
            });
          }
          return activity;
        });
      })
    );
  }

  openModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  viewDetails() {
    this.router.navigate(['/details-activite']);
  }

  selectActivity(activity: any): void {
    this.selectedActivity = activity;
    this.loadActivityDocuments(activity.id); 
  }

  loadActivityDocuments(activityId: number): void {
    this.filesService.getDocumentsByActiviteId(activityId).subscribe({
      next: (documents) => {
        this.selectedActivity.documents = documents;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  removeFilter(filterName: string, value: any) {
    if (Array.isArray(this.filters[filterName])) {
      this.filters[filterName] = this.filters[filterName].filter((item: any) => item !== value);
    } else {
      this.filters[filterName] = '';
    }
    this.updateAppliedFilters();
    this.loadPublicActivities();
  }

  downloadDocument(documentId: number, filename: string) {
    this.filesService.downloadDocument(documentId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erreur lors du téléchargement du document :', error);
      }
    );
  }

  downloadAllDocuments(activityId: number) {
    this.filesService.downloadAllDocuments(activityId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_documents.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error: any) => {
        console.error('Erreur lors du téléchargement de tous les documents :', error);
      }
    );
  }
}
