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
      },
      error: (err) => {
        console.error('Error fetching activity details:', err);
      }
    });
  }

  updateActivite(): void {
    const updateData = { ...this.activiteData };
    delete updateData.id; 

    this.activiteService.updateActivite(this.activiteId, updateData).subscribe({
      next: (response) => {
        console.log('Activity updated successfully:');
        this.toastService.showToast('Succès', 'Mise à jour des données réussie');
      },
      error: (err) => {
        console.error('Error updating activity:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }
}
