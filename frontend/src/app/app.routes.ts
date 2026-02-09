import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientComponent } from './components/patient/patient.component';
import { RendezVousComponent } from './components/rendez-vous/rendez-vous.component';
import { MedecinComponent } from './components/medecin/medecin.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'patients', component: PatientComponent },
      { path: 'rendez-vous', component: RendezVousComponent },
      { path: 'medecins', component: MedecinComponent }
    ]
  },
  { path: 'patients', component: PatientComponent, canActivate: [AuthGuard] },
  { path: 'rendez-vous', component: RendezVousComponent, canActivate: [AuthGuard] },
  { path: 'medecins', component: MedecinComponent, canActivate: [AuthGuard] }
];
