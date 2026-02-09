import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Medecin } from '../../services/api.service';

@Component({
  selector: 'app-medecin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medecin-container">
      <h2>Liste des Médecins</h2>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <table *ngIf="!loading && medecins.length" class="medecins-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Spécialité</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let medecin of medecins">
            <td>{{ medecin.nom }}</td>
            <td>{{ medecin.prenom }}</td>
            <td>{{ medecin.email }}</td>
            <td>{{ medecin.specialite }}</td>
            <td>{{ medecin.telephone }}</td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && medecins.length === 0" class="no-data">
        Aucun médecin trouvé
      </div>
    </div>
  `,
  styles: [`
    .medecin-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
    }

    .medecins-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .medecins-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }

    .medecins-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .medecins-table tr:hover {
      background: #f5f5f5;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 20px;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #667eea;
    }
  `]
})
export class MedecinComponent implements OnInit {
  medecins: Medecin[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMedecins();
  }

  loadMedecins(): void {
    this.loading = true;
    this.apiService.getMedecins().subscribe({
      next: (data) => {
        this.medecins = data.medecins;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
