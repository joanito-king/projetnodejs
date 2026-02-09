import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, RendezVous, Patient, Medecin } from '../../services/api.service';

@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rdv-container">
      <div class="rdv-header">
        <h2>Gestion des Rendez-vous</h2>
        <button (click)="toggleForm()" class="btn btn-add">
          {{ showForm ? 'Annuler' : 'Ajouter Rendez-vous' }}
        </button>
      </div>

      <div *ngIf="showForm" class="form-container">
        <h3>{{ editingId ? 'Modifier' : 'Ajouter' }} Rendez-vous</h3>
        <form (ngSubmit)="saveRendezVous()" #rdvForm="ngForm">
          <div class="form-group">
            <label>Patient</label>
            <select name="idPatient" [(ngModel)]="formData.idPatient" required>
              <option value="">Sélectionner un patient</option>
              <option *ngFor="let p of patients" [value]="p.id">
                {{ p.prenom }} {{ p.nom }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Médecin</label>
            <select name="idMed" [(ngModel)]="formData.idMed" required>
              <option value="">Sélectionner un médecin</option>
              <option *ngFor="let m of medecins" [value]="m.id">
                {{ m.prenom }} {{ m.nom }} ({{ m.specialite }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date et Heure</label>
            <input
              type="datetime-local"
              name="dateHeure"
              [(ngModel)]="formData.dateHeure"
              required
            />
          </div>
          <div class="form-group">
            <label>Statut</label>
            <select name="statut" [(ngModel)]="formData.statut">
              <option value="programmé">Programmé</option>
              <option value="confirmé">Confirmé</option>
              <option value="annulé">Annulé</option>
              <option value="complété">Complété</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea name="notes" [(ngModel)]="formData.notes" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-submit" [disabled]="!rdvForm.valid">
            {{ editingId ? 'Modifier' : 'Ajouter' }}
          </button>
        </form>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <table *ngIf="!loading && rendezVous.length" class="rdv-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Date/Heure</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rdv of rendezVous">
            <td>{{ getPatientName(rdv.idPatient) }}</td>
            <td>{{ getMedecinName(rdv.idMed) }}</td>
            <td>{{ formatDate(rdv.dateHeure) }}</td>
            <td>
              <span [class]="'status status-' + (rdv.statut || 'programmé')">
                {{ rdv.statut || 'Programmé' }}
              </span>
            </td>
            <td>
              <button (click)="editRendezVous(rdv)" class="btn btn-edit">Modifier</button>
              <button (click)="deleteRendezVous(rdv.id!)" class="btn btn-delete">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && rendezVous.length === 0" class="no-data">
        Aucun rendez-vous trouvé
      </div>
    </div>
  `,
  styles: [`
    .rdv-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
    }

    .rdv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .rdv-header h2 {
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

    .btn-delete {
      background: #d32f2f;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
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

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    .rdv-table {
      width: 100%;
      border-collapse: collapse;
    }

    .rdv-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }

    .rdv-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .rdv-table tr:hover {
      background: #f5f5f5;
    }

    .status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-programmé {
      background: #fff3cd;
      color: #856404;
    }

    .status-confirmé {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-annulé {
      background: #f8d7da;
      color: #721c24;
    }

    .status-complété {
      background: #d4edda;
      color: #155724;
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
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  formData: RendezVous = {
    idPatient: 0,
    idMed: 0,
    dateHeure: '',
    statut: 'programmé',
    notes: ''
  };
  showForm = false;
  loading = true;
  editingId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.apiService.getRendezVous().toPromise(),
      this.apiService.getPatients().toPromise(),
      this.apiService.getMedecins().toPromise()
    ]).then(([rdvData, patData, medData]) => {
      if (rdvData) this.rendezVous = rdvData.rendezVous;
      if (patData) this.patients = patData.patients;
      if (medData) this.medecins = medData.medecins;
      this.loading = false;
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
      idPatient: 0,
      idMed: 0,
      dateHeure: '',
      statut: 'programmé',
      notes: ''
    };
    this.editingId = null;
  }

  saveRendezVous(): void {
    if (this.editingId) {
      this.apiService.updateRendezVous(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.toggleForm();
        }
      });
    } else {
      this.apiService.addRendezVous(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.toggleForm();
        }
      });
    }
  }

  editRendezVous(rdv: RendezVous): void {
    this.formData = { ...rdv };
    this.editingId = rdv.id || null;
    this.showForm = true;
  }

  deleteRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.apiService.deleteRendezVous(id).subscribe({
        next: () => {
          this.loadData();
        }
      });
    }
  }

  getPatientName(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Inconnu';
  }

  getMedecinName(id: number): string {
    const medecin = this.medecins.find(m => m.id === id);
    return medecin ? `${medecin.prenom} ${medecin.nom}` : 'Inconnu';
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR');
  }
}
