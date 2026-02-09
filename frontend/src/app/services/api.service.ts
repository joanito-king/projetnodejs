import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  adresse: string;
}

export interface RendezVous {
  id?: number;
  idPatient: number;
  idMed: number;
  dateHeure: string;
  statut?: string;
  notes?: string;
}

export interface Medecin {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';  // Utilisera le proxy en dev, votre domaine en prod
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkUser();
  }

  // ===== Auth =====
  login(credentials: LoginRequest): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.tokenSubject.next(response.token);
        this.userSubject.next(response.user);
      })
    );
  }

  registerSecretary(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register-secretary`, data);
  }

  registerDoctor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register-doctor`, data);
  }

  checkUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/verify`).pipe(
      tap(response => {
        this.userSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // ===== Patients =====
  addPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients/add`, patient);
  }

  getPatients(): Observable<{ patients: Patient[] }> {
    return this.http.get<{ patients: Patient[] }>(`${this.apiUrl}/patients/list`);
  }

  getPatientById(id: number): Observable<{ patient: Patient }> {
    return this.http.get<{ patient: Patient }>(`${this.apiUrl}/patients/${id}`);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${id}`);
  }

  searchPatients(keyword: string): Observable<{ patients: Patient[] }> {
    return this.http.get<{ patients: Patient[] }>(`${this.apiUrl}/patients/search/${keyword}`);
  }

  // ===== Rendez-vous =====
  addRendezVous(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(`${this.apiUrl}/rendezVous/add`, rdv);
  }

  getRendezVous(): Observable<{ rendezVous: RendezVous[] }> {
    return this.http.get<{ rendezVous: RendezVous[] }>(`${this.apiUrl}/rendezVous/list`);
  }

  getRendezVousById(id: number): Observable<{ rendezVous: RendezVous }> {
    return this.http.get<{ rendezVous: RendezVous }>(`${this.apiUrl}/rendezVous/${id}`);
  }

  getDoctorSchedule(idMed: number): Observable<{ rendezVous: RendezVous[] }> {
    return this.http.get<{ rendezVous: RendezVous[] }>(`${this.apiUrl}/rendezVous/doctor/${idMed}`);
  }

  updateRendezVous(id: number, rdv: RendezVous): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/rendezVous/${id}`, rdv);
  }

  deleteRendezVous(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rendezVous/${id}`);
  }

  getAvailableSlots(idMed: number): Observable<{ slots: string[] }> {
    return this.http.get<{ slots: string[] }>(`${this.apiUrl}/rendezVous/available-slots/${idMed}`);
  }

  // ===== Médecins =====
  getMedecins(): Observable<{ medecins: Medecin[] }> {
    return this.http.get<{ medecins: Medecin[] }>(`${this.apiUrl}/medecins/list`);
  }

  getMedecinById(id: number): Observable<{ medecin: Medecin }> {
    return this.http.get<{ medecin: Medecin }>(`${this.apiUrl}/medecins/${id}`);
  }
}
