import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg">
      <div class="back-btn" (click)="goBack()">←</div>
      <div class="card">
        <div class="logo">Medi<span>Sync</span></div>
        <h3 class="subtitle">Espace Secrétariat</h3>

        <form (ngSubmit)="login()" #loginForm="ngForm" class="form">
          <div class="input">
            <input type="text" name="identifier" placeholder="Identifiant / Email" [(ngModel)]="email" required />
          </div>
          <div class="input">
            <input type="password" name="password" placeholder="Mot de passe" [(ngModel)]="password" required />
          </div>

          <button type="submit" [disabled]="loading || !loginForm.valid" class="btn">
            <span *ngIf="!loading">CONNEXION</span>
            <span *ngIf="loading">Connexion en cours...</span>
          </button>
        </form>

        <div *ngIf="error" class="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; height:100%; }
    .bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: linear-gradient(120deg, rgba(10,78,165,0.6), rgba(118,75,162,0.6)), url('/assets/hospital.jpg');
      background-size: cover;
      background-position: center;
      padding: 40px;
    }

    .back-btn{
      position: fixed;
      left:20px;
      top:20px;
      background: rgba(255,255,255,0.12);
      color: white;
      width:40px;
      height:40px;
      border-radius:8px;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      font-size:20px;
      backdrop-filter: blur(4px);
    }

    .card{
      width: 480px;
      max-width: 95%;
      background: rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 40px 36px;
      box-shadow: 0 8px 40px rgba(2,6,23,0.6);
      color: white;
      text-align: center;
      backdrop-filter: blur(8px);
    }

    .logo{ font-size:34px; font-weight:700; margin-bottom:6px; }
    .logo span{ color: #2fe0ff; }
    .subtitle{ margin:0 0 18px 0; opacity:0.9; }

    .form{ display:flex; flex-direction:column; gap:14px; margin-top:10px; }
    .input input{
      width:100%; padding:14px 16px; border-radius:30px; border:none; outline:none;
      font-size:15px; box-sizing:border-box; background: rgba(255,255,255,0.12); color: white;
    }

    .btn{ margin-top:6px; padding:14px; border-radius:30px; border:none; font-weight:700; background: linear-gradient(90deg,#20c3ff,#6b6bff); color:#06263a; cursor:pointer; }

    .error{ margin-top:14px; color:#ffdcdc; background: rgba(255,0,0,0.06); padding:10px; border-radius:8px; }

    @media (max-width:600px){ .card{ padding:24px; } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private apiService: ApiService, private router: Router) {}

  goBack(): void {
    try { history.back(); } catch { this.router.navigate(['/']); }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur de connexion';
      }
    });
  }
}
