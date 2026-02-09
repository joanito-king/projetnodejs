import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-left">
          <h1>{{ appTitle }}</h1>
        </div>
        <div class="nav-right" *ngIf="user">
          <span class="user-info">{{ user.email }}</span>
          <button (click)="logout()" class="btn-logout">Déconnexion</button>
        </div>
      </nav>

      <div class="container">
        <aside class="sidebar">
          <ul class="menu">
            <li><a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a></li>
            <li><a routerLink="/patients" routerLinkActive="active">Patients</a></li>
            <li><a routerLink="/rendez-vous" routerLinkActive="active">Rendez-vous</a></li>
            <li><a routerLink="/medecins" routerLinkActive="active">Médecins</a></li>
          </ul>
        </aside>

        <main class="content">
          <div class="dashboard-stats" *ngIf="isHome">
            <div class="stat-card">
              <h3>Patients</h3>
              <p class="stat-number">{{ patientCount }}</p>
            </div>
            <div class="stat-card">
              <h3>Rendez-vous</h3>
              <p class="stat-number">{{ rdvCount }}</p>
            </div>
            <div class="stat-card">
              <h3>Médecins</h3>
              <p class="stat-number">{{ medecinCount }}</p>
            </div>
          </div>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .navbar h1 {
      margin: 0;
      font-size: 28px;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-info {
      font-size: 14px;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .container {
      display: flex;
      flex: 1;
    }

    .sidebar {
      width: 250px;
      background: white;
      border-right: 1px solid #ddd;
      padding: 20px 0;
    }

    .menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu li {
      margin: 0;
    }

    .menu a {
      display: block;
      padding: 15px 20px;
      color: #333;
      text-decoration: none;
      border-left: 4px solid transparent;
      transition: all 0.3s;
    }

    .menu a:hover {
      background: #f0f0f0;
      border-left-color: #667eea;
    }

    .menu a.active {
      background: #f0f0f0;
      border-left-color: #667eea;
      color: #667eea;
      font-weight: bold;
    }

    .content {
      flex: 1;
      padding: 40px;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 15px;
      color: #667eea;
      font-size: 18px;
    }

    .stat-number {
      margin: 0;
      font-size: 48px;
      font-weight: bold;
      color: #333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  appTitle = 'Gestion RDV Médicaux';
  user: User | null = null;
  patientCount = 0;
  rdvCount = 0;
  medecinCount = 0;
  isHome = true;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.user$.subscribe(user => {
      this.user = user;
    });

    this.loadStats();
  }

  loadStats(): void {
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patientCount = data.patients.length;
      }
    });

    this.apiService.getRendezVous().subscribe({
      next: (data) => {
        this.rdvCount = data.rendezVous.length;
      }
    });

    this.apiService.getMedecins().subscribe({
      next: (data) => {
        this.medecinCount = data.medecins.length;
      }
    });
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}
