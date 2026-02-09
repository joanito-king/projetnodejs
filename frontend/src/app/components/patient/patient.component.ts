import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Patient } from '../../services/api.service';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="patient-container">
      <div class="patient-header">
        <h2>Gestion des Patients</h2>
        <button (click)="toggleForm()" class="btn btn-add">
          {{ showForm ? 'Annuler' : 'Ajouter Patient' }}
        </button>
      </div>

      <div *ngIf="showForm" class="form-container">
        <h3>{{ editingId ? 'Modifier' : 'Ajouter' }} Patient</h3>
        <form (ngSubmit)="savePatient()" #patientForm="ngForm">
          <div class="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="nom"
              [(ngModel)]="formData.nom"
              required
            />
          </div>
          <div class="form-group">
            <label>Prénom</label>
            <input
              type="text"
              name="prenom"
              [(ngModel)]="formData.prenom"
              required
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="formData.email"
              required
            />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              [(ngModel)]="formData.telephone"
              required
            />
          </div>
          <div class="form-group">
            <label>Date de Naissance</label>
            <input
              type="date"
              name="dateNaissance"
              [(ngModel)]="formData.dateNaissance"
              required
            />
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input
              type="text"
              name="adresse"
              [(ngModel)]="formData.adresse"
              required
            />
          </div>
          <button type="submit" class="btn btn-submit" [disabled]="!patientForm.valid">
            {{ editingId ? 'Modifier' : 'Ajouter' }}
          </button>
        </form>
      </div>

      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Rechercher un patient..."
          (ngModelChange)="search()"
        />
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <table *ngIf="!loading && patients.length" class="patients-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let patient of patients">
            <td>{{ patient.nom }}</td>
            <td>{{ patient.prenom }}</td>
            <td>{{ patient.email }}</td>
            <td>{{ patient.telephone }}</td>
            <td>
              <button (click)="editPatient(patient)" class="btn btn-edit">Modifier</button>
              <button (click)="deletePatient(patient.id!)" class="btn btn-delete">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && patients.length === 0" class="no-data">
        Aucun patient trouvé
      </div>
    </div>
  `,
  styles: [`
    .patient-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
    }

    .patient-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .patient-header h2 {
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }

    .btn-add {
      background: #667eea;
      color: white;
    }

    .btn-add:hover {
      background: #5568d3;
    }

    .btn-edit {
      background: #44546a;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
      margin-right: 5px;
    }

    .btn-edit:hover {
      background: #2c2f33;
    }

    .btn-delete {
      background: #d32f2f;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
    }

    .btn-delete:hover {
      background: #b71c1c;
    }

    .btn-submit {
      background: #667eea;
      color: white;
      width: 100%;
    }

    .form-container {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .search-bar {
      margin-bottom: 20px;
    }

    .search-bar input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
    }

    .patients-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }

    .patients-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .patients-table tr:hover {
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
export class PatientComponent implements OnInit {
  patients: Patient[] = [];
  formData: Patient = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    adresse: ''
  };
  showForm = false;
  searchTerm = '';
  loading = true;
  editingId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patients = data.patients;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      dateNaissance: '',
      adresse: ''
    };
    this.editingId = null;
  }

  savePatient(): void {
    if (this.editingId) {
      this.apiService.updatePatient(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadPatients();
          this.toggleForm();
        }
      });
    } else {
      this.apiService.addPatient(this.formData).subscribe({
        next: () => {
          this.loadPatients();
          this.toggleForm();
        }
      });
    }
  }

  editPatient(patient: Patient): void {
    this.formData = { ...patient };
    this.editingId = patient.id || null;
    this.showForm = true;
  }

  deletePatient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.apiService.deletePatient(id).subscribe({
        next: () => {
          this.loadPatients();
        }
      });
    }
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.loadPatients();
    } else {
      this.apiService.searchPatients(this.searchTerm).subscribe({
        next: (data) => {
          this.patients = data.patients;
        }
      });
    }
  }
}
