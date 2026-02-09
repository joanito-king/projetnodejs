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
        <div class="logo">Victoria<span>Clinic</span></div>

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
      background-image: linear-gradient(135deg, rgba(124,58,237,0.75), rgba(168,85,247,0.75)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><filter id="shadow"><feGaussianBlur in="SourceGraphic" stdDeviation="3"/></filter></defs><rect width="1200" height="800" fill="%23111"/><g filter="url(%23shadow)" opacity="0.3"><rect x="100" y="120" width="280" height="500" fill="%23555"/><polygon points="100,120 240,50 380,120" fill="%23444"/><circle cx="200" cy="250" r="8" fill="%23999"/><circle cx="200" cy="300" r="8" fill="%23999"/><circle cx="200" cy="350" r="8" fill="%23999"/><circle cx="200" cy="400" r="8" fill="%23999"/><circle cx="320" cy="250" r="8" fill="%23999"/><circle cx="320" cy="300" r="8" fill="%23999"/><circle cx="320" cy="350" r="8" fill="%23999"/><circle cx="320" cy="400" r="8" fill="%23999"/><rect x="550" y="80" width="320" height="580" fill="%23555"/><polygon points="550,80 710,0 870,80" fill="%23444"/><circle cx="630" cy="200" r="8" fill="%23999"/><circle cx="630" cy="280" r="8" fill="%23999"/><circle cx="630" cy="360" r="8" fill="%23999"/><circle cx="790" cy="200" r="8" fill="%23999"/><circle cx="790" cy="280" r="8" fill="%23999"/><circle cx="790" cy="360" r="8" fill="%23999"/><rect x="900" y="250" width="240" height="370" fill="%23555"/><polygon points="900,250 1020,200 1140,250" fill="%23444"/><circle cx="970" cy="350" r="8" fill="%23999"/><circle cx="970" cy="430" r="8" fill="%23999"/><circle cx="1070" cy="350" r="8" fill="%23999"/><circle cx="1070" cy="430" r="8" fill="%23999"/></g></svg>');
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

    .logo{ font-size:42px; font-weight:700; margin-bottom:30px; letter-spacing:0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .logo span{ color: #a855f7; font-weight:800; }

    .form{ display:flex; flex-direction:column; gap:14px; margin-top:10px; }
    .input input{
      width:100%; padding:14px 16px; border-radius:30px; border:none; outline:none;
      font-size:15px; box-sizing:border-box; background: rgba(255,255,255,0.12); color: white;
    }

    .btn{ margin-top:8px; padding:14px; border-radius:30px; border:none; font-weight:700; font-size:15px; letter-spacing:0.5px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; cursor:pointer; transition: all 0.3s; box-shadow: 0 4px 20px rgba(168,85,247,0.4); }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(168,85,247,0.6); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
