const API_URL = 'http://localhost:5002/api';

class App {
    constructor() {
        this.user = null;
        this.token = null;
        this.allPatients = [];
        this.allMedecins = [];
        this.allRendezVous = [];
        this.init();
    }

    async init() {
        console.log('App initialized');
        this.checkAuth();
    }

    async checkAuth() {
        console.log('Checking auth...');
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.user = data.user;
                    this.token = token;
                    console.log('User logged in:', this.user);
                    this.showDashboard();
                    return;
                }
            } catch (error) {
                console.error('Error verifying token:', error);
            }
        }
        console.log('Showing login');
        this.showLogin();
    }

    showLogin() {
        try {
            const app = document.getElementById('app');
            if (!app) {
                console.error('Element #app not found!');
                return;
            }
            app.innerHTML = `
                <div class="container">
                    <div class="auth-container">
                        <div class="logo">🏥</div>
                        <h1>Gestion RV Médicaux</h1>
                        <p>Connectez-vous à votre compte</p>
                        <div id="alertContainer"></div>
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="login">Identifiant</label>
                                <input type="text" id="login" name="login" required placeholder="Entrez votre identifiant">
                            </div>
                            <div class="form-group">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" name="password" required placeholder="Entrez votre mot de passe">
                            </div>
                            <button type="submit">Se connecter</button>
                        </form>
                    </div>
                </div>
            `;

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }
        } catch (error) {
            console.error('Error in showLogin:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showDashboard();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Erreur de connexion', 'error');
        }
    }

    showDashboard() {
        const app = document.getElementById('app');
        const userRole = this.user.role === 'secretaire' ? 'Secrétaire' : 'Médecin';

        app.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard">
                    <div class="top-bar">
                        <h1>Gestion des Rendez-vous</h1>
                        <div class="user-info">
                            <span>Bienvenue, <strong>${this.user.prenom} ${this.user.nom}</strong></span>
                            <span class="badge">${userRole}</span>
                            <button class="export-btn" onclick="app.downloadDatabase()" title="Exporter la base de données">📥 Exporter BD</button>
                            <button class="import-btn" onclick="app.openImportDialog()" title="Importer un fichier SQL">📤 Importer BD</button>
                            <button class="logout-btn" onclick="app.logout()">Déconnexion</button>
                        </div>
                    </div>

                    ${this.user.role === 'secretaire' ? this.getSecretaireNav() : this.getDoctorNav()}

                    <div class="content" id="contentArea">
                        <!-- Content loaded here -->
                    </div>
                </div>
            </div>

            <!-- Modals -->
            <div id="patientModal" class="modal"></div>
            <div id="medecinModal" class="modal"></div>
            <div id="rvModal" class="modal"></div>
            <div id="demandeModal" class="modal"></div>
        `;

        if (this.user.role === 'secretaire') {
            this.loadPatients();
        } else {
            this.loadDoctorSchedule();
        }
    }

    getSecretaireNav() {
        return `
            <div class="nav-tabs">
                <button class="nav-btn active" data-section="patients">Patients</button>
                <button class="nav-btn" data-section="medecins">Médecins</button>
                <button class="nav-btn" data-section="rendez-vous">Rendez-vous</button>
                <button class="nav-btn" data-section="demandes">Demandes de modification</button>
            </div>
        `;
    }

    getDoctorNav() {
        return `
            <div class="nav-tabs">
                <button class="nav-btn active" data-section="mon-planning">Mon Planning</button>
                <button class="nav-btn" data-section="mes-demandes">Mes Demandes</button>
            </div>
        `;
    }

    loadPatients() {
        this.setSection('patients');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="patients">
                <h2>Gestion des Patients</h2>
                <div id="alertContainer"></div>
                <div class="search-bar">
                    <input type="text" id="searchPatients" placeholder="🔍 Rechercher par nom ou prénom..." class="search-input">
                </div>
                <div class="form-container">
                    <h3>Ajouter un patient</h3>
                    <form id="addPatientForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nom</label>
                                <input type="text" name="nom" required>
                            </div>
                            <div class="form-group">
                                <label>Prénom</label>
                                <input type="text" name="prenom" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Âge</label>
                                <input type="number" name="age">
                            </div>
                            <div class="form-group">
                                <label>Sexe</label>
                                <input type="text" name="sexe" placeholder="M/F">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Téléphone</label>
                                <input type="tel" name="tel">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email">
                            </div>
                        </div>
                        <div class="form-row full">
                            <div class="form-group">
                                <label>Adresse</label>
                                <input type="text" name="adresse">
                            </div>
                        </div>
                        <button type="submit">Ajouter Patient</button>
                    </form>
                </div>
                <div id="patientsList"></div>
            </div>
        `;

        document.getElementById('addPatientForm').addEventListener('submit', (e) => this.addPatient(e));
        document.getElementById('searchPatients').addEventListener('input', (e) => this.filterPatients(e.target.value));
        this.getPatients();
    }

    async addPatient(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            age: form.age.value || null,
            sexe: form.sexe.value || null,
            tel: form.tel.value || null,
            email: form.email.value || null,
            adresse: form.adresse.value || null
        };

        try {
            const response = await fetch(`${API_URL}/patients/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Patient ajouté avec succès', 'success', 'alertContainer');
                form.reset();
                this.getPatients();
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de l\'ajout', 'error', 'alertContainer');
        }
    }

    async getPatients() {
        try {
            const response = await fetch(`${API_URL}/patients/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.allPatients = result.patients;
                this.displayPatients(result.patients);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    filterPatients(searchTerm) {
        const filtered = this.allPatients.filter(p => {
            const fullName = `${p.nom} ${p.prenom}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
        this.displayPatients(filtered);
    }

    displayPatients(patients) {
        const container = document.getElementById('patientsList');
        if (patients.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>Aucun patient enregistré</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Nom</th><th>Prénom</th><th>Âge</th><th>Téléphone</th><th>Email</th><th>Actions</th></tr></thead><tbody>';

        patients.forEach(p => {
            html += `<tr>
                <td>${p.nom}</td>
                <td>${p.prenom}</td>
                <td>${p.age || '-'}</td>
                <td>${p.tel || '-'}</td>
                <td>${p.email || '-'}</td>
                <td><div class="action-buttons">
                    <button class="btn btn-edit" onclick="app.editPatient(${p.idPa})">Modifier</button>
                    <button class="btn btn-delete" onclick="app.deletePatient(${p.idPa})">Supprimer</button>
                </div></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async editPatient(id) {
        try {
            const response = await fetch(`${API_URL}/patients/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const patient = result.patient;
                const modal = document.getElementById('patientModal');
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Modifier le patient: ${patient.prenom} ${patient.nom}</h2>
                            <button class="close-btn" onclick="document.getElementById('patientModal').style.display='none'">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="editPatientForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Nom</label>
                                        <input type="text" name="nom" value="${patient.nom}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Prénom</label>
                                        <input type="text" name="prenom" value="${patient.prenom}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Téléphone</label>
                                        <input type="tel" name="tel" value="${patient.tel || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value="${patient.email || ''}">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Adresse</label>
                                        <input type="text" name="adresse" value="${patient.adresse || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Date de naissance</label>
                                        <input type="date" name="date_naissance" value="${patient.date_naissance || ''}">
                                    </div>
                                </div>
                                <div class="form-row full">
                                    <div class="form-group">
                                        <label>Observations</label>
                                        <textarea name="observations" placeholder="Notes">${patient.observations || ''}</textarea>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-cancel" onclick="document.getElementById('patientModal').style.display='none'">Annuler</button>
                                    <button type="submit" class="btn btn-save">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                modal.style.display = 'flex';
                
                document.getElementById('editPatientForm').addEventListener('submit', (e) => this.saveEditPatient(e, id));
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors du chargement', 'error', 'alertContainer');
        }
    }

    async saveEditPatient(e, id) {
        e.preventDefault();
        const form = e.target;
        const data = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            tel: form.tel.value || null,
            email: form.email.value || null,
            adresse: form.adresse.value || null,
            date_naissance: form.date_naissance.value || null,
            observations: form.observations.value || null
        };

        try {
            const response = await fetch(`${API_URL}/patients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Patient modifié avec succès', 'success', 'alertContainer');
                document.getElementById('patientModal').style.display = 'none';
                this.getPatients();
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de la modification', 'error', 'alertContainer');
        }
    }

    async deletePatient(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
            try {
                const response = await fetch(`${API_URL}/patients/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                const result = await response.json();
                if (result.success) {
                    this.showAlert('Patient supprimé', 'success', 'alertContainer');
                    this.getPatients();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    loadMedecins() {
        this.setSection('medecins');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="medecins">
                <h2>Gestion des Médecins</h2>
                <div id="alertContainer"></div>
                <div class="search-bar">
                    <input type="text" id="searchMedecins" placeholder="🔍 Rechercher par nom ou prénom..." class="search-input">
                </div>
                <div class="form-container">
                    <h3>Ajouter un médecin</h3>
                    <form id="addMedecinForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nom</label>
                                <input type="text" name="nom" required>
                            </div>
                            <div class="form-group">
                                <label>Prénom</label>
                                <input type="text" name="prenom" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Spécialité</label>
                                <input type="text" name="specialite" placeholder="Ex: Cardiologue">
                            </div>
                            <div class="form-group">
                                <label>Téléphone</label>
                                <input type="tel" name="tel">
                            </div>
                        </div>
                        <div class="form-row full">
                            <div class="form-group">
                                <label>Email <small style="color: #667eea; font-weight: 600;">(@clinic.fr)</small></label>
                                <input type="email" name="email" placeholder="exemple@clinic.fr">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Identifiant (Login)</label>
                                <input type="text" name="login" required placeholder="Identifiant unique">
                            </div>
                            <div class="form-group">
                                <label>Mot de passe</label>
                                <input type="password" name="password" required>
                            </div>
                        </div>
                        <button type="submit">Ajouter Médecin</button>
                    </form>
                </div>
                <div id="medecinsList"></div>
            </div>
        `;

        document.getElementById('addMedecinForm').addEventListener('submit', (e) => this.addMedecin(e));
        document.getElementById('searchMedecins').addEventListener('input', (e) => this.filterMedecins(e.target.value));
        this.getMedecins();
    }

    async addMedecin(e) {
        e.preventDefault();
        const form = e.target;
        
        const email = form.email.value.trim();
        if (email && !email.endsWith('@clinic.fr')) {
            this.showAlert('L\'email doit se terminer par @clinic.fr', 'error', 'alertContainer');
            return;
        }

        const data = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            specialite: form.specialite.value || null,
            tel: form.tel.value || null,
            email: email || null,
            login: form.login.value,
            password: form.password.value
        };

        try {
            const response = await fetch(`${API_URL}/medecins/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Médecin ajouté avec succès', 'success', 'alertContainer');
                form.reset();
                this.getMedecins();
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de l\'ajout', 'error', 'alertContainer');
        }
    }

    async getMedecins() {
        try {
            const response = await fetch(`${API_URL}/medecins/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.allMedecins = result.medecins;
                this.displayMedecins(result.medecins);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    filterMedecins(searchTerm) {
        const filtered = this.allMedecins.filter(m => {
            const fullName = `${m.nom} ${m.prenom}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
        this.displayMedecins(filtered);
    }

    displayMedecins(medecins) {
        const container = document.getElementById('medecinsList');
        if (medecins.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👨‍⚕️</div><p>Aucun médecin enregistré</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Nom</th><th>Prénom</th><th>Spécialité</th><th>Téléphone</th><th>Email</th><th>Actions</th></tr></thead><tbody>';

        medecins.forEach(m => {
            html += `<tr>
                <td>${m.nom}</td>
                <td>${m.prenom}</td>
                <td>${m.specialite || '-'}</td>
                <td>${m.tel || '-'}</td>
                <td>${m.email || '-'}</td>
                <td><div class="action-buttons">
                    <button class="btn btn-edit" onclick="app.editMedecin(${m.idMed})">Modifier</button>
                    <button class="btn btn-delete" onclick="app.deleteMedecin(${m.idMed})">Supprimer</button>
                </div></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async editMedecin(id) {
        try {
            const response = await fetch(`${API_URL}/medecins/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const medecin = result.medecin;
                const modal = document.getElementById('medecinModal');
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Modifier le médecin: ${medecin.prenom} ${medecin.nom}</h2>
                            <button class="close-btn" onclick="document.getElementById('medecinModal').style.display='none'">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="editMedecinForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Nom</label>
                                        <input type="text" name="nom" value="${medecin.nom}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Prénom</label>
                                        <input type="text" name="prenom" value="${medecin.prenom}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Spécialité</label>
                                        <input type="text" name="specialite" value="${medecin.specialite || ''}" placeholder="Ex: Cardiologue">
                                    </div>
                                    <div class="form-group">
                                        <label>Téléphone</label>
                                        <input type="tel" name="tel" value="${medecin.tel || ''}">
                                    </div>
                                </div>
                                <div class="form-row full">
                                    <div class="form-group">
                                        <label>Email <small style="color: #667eea; font-weight: 600;">(@clinic.fr)</small></label>
                                        <input type="email" name="email" value="${medecin.email || ''}" placeholder="exemple@clinic.fr">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Identifiant (Login)</label>
                                        <input type="text" name="login" value="${medecin.login || ''}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Mot de passe <small>(laisser vide pour ne pas modifier)</small></label>
                                        <input type="password" name="password" placeholder="Nouveau mot de passe">
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-cancel" onclick="document.getElementById('medecinModal').style.display='none'">Annuler</button>
                                    <button type="submit" class="btn btn-save">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                modal.style.display = 'flex';
                
                document.getElementById('editMedecinForm').addEventListener('submit', (e) => this.saveEditMedecin(e, id));
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors du chargement', 'error', 'alertContainer');
        }
    }

    async saveEditMedecin(e, id) {
        e.preventDefault();
        const form = e.target;
        
        const email = form.email.value.trim();
        if (email && !email.endsWith('@clinic.fr')) {
            this.showAlert('L\'email doit se terminer par @clinic.fr', 'error', 'alertContainer');
            return;
        }

        const data = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            specialite: form.specialite.value || null,
            tel: form.tel.value || null,
            email: email || null,
            login: form.login.value,
            password: form.password.value || null
        };

        try {
            const response = await fetch(`${API_URL}/medecins/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Médecin modifié avec succès', 'success', 'alertContainer');
                document.getElementById('medecinModal').style.display = 'none';
                this.getMedecins();
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de la modification', 'error', 'alertContainer');
        }
    }

    async deleteMedecin(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
            try {
                const response = await fetch(`${API_URL}/medecins/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                const result = await response.json();
                if (result.success) {
                    this.showAlert('Médecin supprimé', 'success', 'alertContainer');
                    this.getMedecins();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    loadRendezVous() {
        this.setSection('rendez-vous');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="rendez-vous">
                <h2>Gestion des Rendez-vous</h2>
                <div id="alertContainer"></div>
                <div class="form-container">
                    <h3>Ajouter un rendez-vous</h3>
                    <form id="addRVForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Médecin</label>
                                <select name="idMed" id="selectMedecin" required>
                                    <option value="">Sélectionner un médecin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Patient</label>
                                <select name="idPa" id="selectPatient" required>
                                    <option value="">Sélectionner un patient</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" name="dateRV" required>
                            </div>
                            <div class="form-group">
                                <label>Heure</label>
                                <select name="heure" id="selectHeure" required>
                                    <option value="">Sélectionner une heure</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row full">
                            <div class="form-group">
                                <label>Motif</label>
                                <input type="text" name="motif" placeholder="Motif de la consultation">
                            </div>
                        </div>
                        <button type="submit">Ajouter Rendez-vous</button>
                    </form>
                </div>
                <div id="rvList"></div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            select {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1em;
                transition: border-color 0.3s;
                background: white;
                cursor: pointer;
            }
            select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
        `;
        document.head.appendChild(style);

        this.loadMedecinsForRV();
        this.loadPatientsForRV();
        this.getRendezVous();

        document.getElementById('addRVForm').addEventListener('submit', (e) => this.addRendezVous(e));
        document.getElementById('selectMedecin').addEventListener('change', (e) => this.loadAvailableSlots(e.target.value, document.querySelector('input[name="dateRV"]').value));
        document.querySelector('input[name="dateRV"]').addEventListener('change', (e) => this.loadAvailableSlots(document.getElementById('selectMedecin').value, e.target.value));
    }

    async loadMedecinsForRV() {
        try {
            const response = await fetch(`${API_URL}/medecins/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const select = document.getElementById('selectMedecin');
                result.medecins.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.idMed;
                    option.textContent = `${m.nom} ${m.prenom} - ${m.specialite || 'N/A'}`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async loadPatientsForRV() {
        try {
            const response = await fetch(`${API_URL}/patients/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const select = document.getElementById('selectPatient');
                result.patients.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.idPa;
                    option.textContent = `${p.nom} ${p.prenom}`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async loadAvailableSlots(idMed, date) {
        if (!idMed || !date) {
            const select = document.getElementById('selectHeure');
            select.innerHTML = '<option value="">Sélectionner une heure</option>';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/rendezVous/available-slots/${idMed}?date=${date}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const select = document.getElementById('selectHeure');
                select.innerHTML = '<option value="">Sélectionner une heure</option>';
                result.available.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async addRendezVous(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            idMed: parseInt(form.idMed.value),
            idPa: parseInt(form.idPa.value),
            dateRV: form.dateRV.value,
            heure: form.heure.value,
            motif: form.motif.value || null
        };

        try {
            const response = await fetch(`${API_URL}/rendezVous/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Rendez-vous ajouté avec succès', 'success', 'alertContainer');
                form.reset();
                this.getRendezVous();
                this.loadAvailableSlots('', '');
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de l\'ajout', 'error', 'alertContainer');
        }
    }

    async getRendezVous() {
        try {
            const response = await fetch(`${API_URL}/rendezVous/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.displayRendezVous(result.rendezVous);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayRendezVous(rdvs) {
        const container = document.getElementById('rvList');
        if (rdvs.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>Aucun rendez-vous enregistré</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Médecin</th><th>Patient</th><th>Date</th><th>Heure</th><th>Motif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>';

        rdvs.forEach(rv => {
            const date = new Date(rv.dateRV).toLocaleDateString('fr-FR');
            html += `<tr>
                <td>${rv.nom_medecin} ${rv.prenom_medecin}</td>
                <td>${rv.nom_patient} ${rv.prenom_patient}</td>
                <td>${date}</td>
                <td>${rv.heure}</td>
                <td>${rv.motif || '-'}</td>
                <td><span class="badge-status badge-${rv.statut}">${rv.statut}</span></td>
                <td><div class="action-buttons">
                    <button class="btn btn-edit" onclick="app.editRendezVous(${rv.idRV})">Modifier</button>
                    <button class="btn btn-delete" onclick="app.deleteRendezVous(${rv.idRV})">Supprimer</button>
                </div></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async editRendezVous(id) {
        try {
            const response = await fetch(`${API_URL}/rendezVous/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                const rv = result.rendezVous;
                const modal = document.getElementById('rvModal');
                const dateRV = new Date(rv.dateRV).toISOString().split('T')[0];
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Modifier le rendez-vous</h2>
                            <button class="close-btn" onclick="document.getElementById('rvModal').style.display='none'">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="editRVForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Médecin</label>
                                        <select name="idMed" id="editMedSelect" required>
                                            <option value="">Sélectionner un médecin</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Patient</label>
                                        <select name="idPa" id="editPatSelect" required>
                                            <option value="">Sélectionner un patient</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date</label>
                                        <input type="date" name="dateRV" value="${dateRV}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Heure</label>
                                        <input type="time" name="heure" value="${rv.heure}" required>
                                    </div>
                                </div>
                                <div class="form-row full">
                                    <div class="form-group">
                                        <label>Motif</label>
                                        <input type="text" name="motif" value="${rv.motif || ''}" placeholder="Motif de la consultation">
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-cancel" onclick="document.getElementById('rvModal').style.display='none'">Annuler</button>
                                    <button type="submit" class="btn btn-save">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                modal.style.display = 'flex';
                
                this.populateEditSelects(rv.idMed, rv.idPa);
                
                document.getElementById('editRVForm').addEventListener('submit', (e) => this.saveEditRendezVous(e, id));
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors du chargement', 'error', 'alertContainer');
        }
    }

    async populateEditSelects(idMed, idPa) {
        try {
            const response = await fetch(`${API_URL}/medecins/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const result = await response.json();
            if (result.success) {
                const select = document.getElementById('editMedSelect');
                result.medecins.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.idMed;
                    option.textContent = `${m.nom} ${m.prenom} - ${m.specialite || 'N/A'}`;
                    if (m.idMed === idMed) option.selected = true;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }

        try {
            const response = await fetch(`${API_URL}/patients/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const result = await response.json();
            if (result.success) {
                const select = document.getElementById('editPatSelect');
                result.patients.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.idPa;
                    option.textContent = `${p.nom} ${p.prenom}`;
                    if (p.idPa === idPa) option.selected = true;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async saveEditRendezVous(e, id) {
        e.preventDefault();
        const form = e.target;
        const data = {
            idMed: parseInt(form.idMed.value),
            idPa: parseInt(form.idPa.value),
            dateRV: form.dateRV.value,
            heure: form.heure.value,
            motif: form.motif.value || null
        };

        try {
            const response = await fetch(`${API_URL}/rendezVous/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Rendez-vous modifié avec succès', 'success', 'alertContainer');
                document.getElementById('rvModal').style.display = 'none';
                this.getRendezVous();
            } else {
                this.showAlert(result.message, 'error', 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de la modification', 'error', 'alertContainer');
        }
    }

    async deleteRendezVous(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            try {
                const response = await fetch(`${API_URL}/rendezVous/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                const result = await response.json();
                if (result.success) {
                    this.showAlert('Rendez-vous supprimé', 'success', 'alertContainer');
                    this.getRendezVous();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    loadDemandes() {
        this.setSection('demandes');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="demandes">
                <h2>Demandes de Modification de Rendez-vous</h2>
                <div id="demandesContainer"></div>
            </div>
        `;

        this.getPendingRequests();
    }

    async getPendingRequests() {
        try {
            const response = await fetch(`${API_URL}/demandes/pending`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.displayDemandes(result.demandes);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayDemandes(demandes) {
        const container = document.getElementById('demandesContainer');
        if (demandes.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>Aucune demande en attente</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Médecin</th><th>Patient</th><th>Date Actuelle</th><th>Nouvelle Date</th><th>Nouvelle Heure</th><th>Motif</th><th>Actions</th></tr></thead><tbody>';

        demandes.forEach(d => {
            const dateActuelle = new Date(d.dateRV).toLocaleDateString('fr-FR');
            const nouvelleDate = new Date(d.nouvelle_date).toLocaleDateString('fr-FR');
            html += `<tr>
                <td>${d.nom_medecin} ${d.prenom_medecin}</td>
                <td>${d.nom_patient} ${d.prenom_patient}</td>
                <td>${dateActuelle} ${d.heure}</td>
                <td>${nouvelleDate}</td>
                <td>${d.nouvelle_heure}</td>
                <td>${d.motif || '-'}</td>
                <td><div class="action-buttons">
                    <button class="btn btn-accept" onclick="app.acceptDemande(${d.idDemande})">Accepter</button>
                    <button class="btn btn-reject" onclick="app.rejectDemande(${d.idDemande})">Refuser</button>
                </div></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async acceptDemande(id) {
        try {
            const response = await fetch(`${API_URL}/demandes/${id}/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Demande acceptée et RV modifié', 'success');
                this.getPendingRequests();
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async rejectDemande(id) {
        try {
            const response = await fetch(`${API_URL}/demandes/${id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Demande refusée', 'success');
                this.getPendingRequests();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    loadDoctorSchedule() {
        this.setSection('mon-planning');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="mon-planning">
                <h2>Mon Planning de Rendez-vous</h2>
                <div id="demandeForm" class="form-container" style="display: none;">
                    <h3>Demander une modification</h3>
                    <form id="submitDemandeForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Rendez-vous</label>
                                <select name="idRV" required id="selectRV">
                                    <option value="">Sélectionner un RV à modifier</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nouvelle Date</label>
                                <input type="date" name="nouvelle_date" required>
                            </div>
                            <div class="form-group">
                                <label>Nouvelle Heure</label>
                                <input type="time" name="nouvelle_heure" required>
                            </div>
                        </div>
                        <div class="form-row full">
                            <div class="form-group">
                                <label>Motif de la modification</label>
                                <input type="text" name="motif">
                            </div>
                        </div>
                        <button type="submit">Envoyer la demande</button>
                    </form>
                </div>
                <div id="scheduleContainer"></div>
                <button id="requestModBtn" class="btn btn-request" style="margin-top: 20px;">Demander une modification</button>
            </div>
        `;

        this.getDoctorSchedule();

        document.getElementById('requestModBtn').addEventListener('click', () => {
            document.getElementById('demandeForm').style.display = document.getElementById('demandeForm').style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('submitDemandeForm').addEventListener('submit', (e) => this.submitDemandeModification(e));
    }

    async getDoctorSchedule() {
        try {
            const response = await fetch(`${API_URL}/rendezVous/doctor/${this.user.id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.displayDoctorSchedule(result.rendezVous);
                this.populateRVSelect(result.rendezVous);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayDoctorSchedule(rdvs) {
        const container = document.getElementById('scheduleContainer');
        if (rdvs.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>Aucun rendez-vous programmé</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Patient</th><th>Date</th><th>Heure</th><th>Motif</th><th>Statut</th></tr></thead><tbody>';

        rdvs.forEach(rv => {
            const date = new Date(rv.dateRV).toLocaleDateString('fr-FR');
            html += `<tr>
                <td>${rv.nom_patient} ${rv.prenom_patient}</td>
                <td>${date}</td>
                <td>${rv.heure}</td>
                <td>${rv.motif || '-'}</td>
                <td><span class="badge-status badge-${rv.statut}">${rv.statut}</span></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    populateRVSelect(rdvs) {
        const select = document.getElementById('selectRV');
        select.innerHTML = '<option value="">Sélectionner un RV à modifier</option>';
        rdvs.forEach(rv => {
            const date = new Date(rv.dateRV).toLocaleDateString('fr-FR');
            const option = document.createElement('option');
            option.value = rv.idRV;
            option.textContent = `${rv.nom_patient} ${rv.prenom_patient} - ${date} ${rv.heure}`;
            select.appendChild(option);
        });
    }

    async submitDemandeModification(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            idRV: parseInt(form.idRV.value),
            nouvelle_date: form.nouvelle_date.value,
            nouvelle_heure: form.nouvelle_heure.value,
            motif: form.motif.value || null
        };

        try {
            const response = await fetch(`${API_URL}/demandes/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.showAlert('Demande de modification envoyée au secrétaire', 'success');
                form.reset();
                document.getElementById('demandeForm').style.display = 'none';
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de l\'envoi', 'error');
        }
    }

    loadMesDemandes() {
        this.setSection('mes-demandes');
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <div class="section active" id="mes-demandes">
                <h2>Mes Demandes de Modification</h2>
                <div id="mesDemandes"></div>
            </div>
        `;

        this.getDoctorRequests();
    }

    async getDoctorRequests() {
        try {
            const response = await fetch(`${API_URL}/demandes/doctor/${this.user.id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();
            if (result.success) {
                this.displayDoctorRequests(result.demandes);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayDoctorRequests(demandes) {
        const container = document.getElementById('mesDemandes');
        if (demandes.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>Aucune demande de modification</p></div>';
            return;
        }

        let html = '<div class="table-responsive"><table><thead><tr><th>Patient</th><th>Date Actuelle</th><th>Nouvelle Date</th><th>Nouvelle Heure</th><th>Statut</th></tr></thead><tbody>';

        demandes.forEach(d => {
            const dateActuelle = new Date(d.dateRV).toLocaleDateString('fr-FR');
            const nouvelleDate = new Date(d.nouvelle_date).toLocaleDateString('fr-FR');
            html += `<tr>
                <td>${d.nom_patient} ${d.prenom_patient}</td>
                <td>${dateActuelle} ${d.heure}</td>
                <td>${nouvelleDate}</td>
                <td>${d.nouvelle_heure}</td>
                <td><span class="badge-status badge-${d.statut}">${d.statut}</span></td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    setSection(section) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sec = e.target.dataset.section;
                if (this.user.role === 'secretaire') {
                    if (sec === 'patients') this.loadPatients();
                    else if (sec === 'medecins') this.loadMedecins();
                    else if (sec === 'rendez-vous') this.loadRendezVous();
                    else if (sec === 'demandes') this.loadDemandes();
                } else {
                    if (sec === 'mon-planning') this.loadDoctorSchedule();
                    else if (sec === 'mes-demandes') this.loadMesDemandes();
                }
            });
        });
    }

    showAlert(message, type = 'error', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        container.innerHTML = '';
        container.appendChild(alertDiv);

        if (type === 'success') {
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.user = null;
        this.showLogin();
    }

    async downloadDatabase() {
        try {
            const response = await fetch(`${API_URL}/export/database`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }

            // Récupérer le nom du fichier depuis l'en-tête
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'backup_gestion_rv.sql';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) filename = filenameMatch[1];
            }

            // Créer un blob et télécharger
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showAlert(`✓ Base de données exportée: ${filename}`, 'success', 'alertContainer');
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Erreur lors de l\'export de la base de données', 'error', 'alertContainer');
        }
    }

    openImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.sql';
        input.addEventListener('change', () => this.uploadDatabaseFile(input.files[0]));
        input.click();
    }

    async uploadDatabaseFile(file) {
        if (!file) return;
        const form = new FormData();
        form.append('sqlfile', file);

        try {
            const response = await fetch(`${API_URL}/export/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` },
                body: form
            });

            const result = await response.json();
            if (response.ok) {
                this.showAlert(result.message || 'Import effectué', 'success');
            } else {
                this.showAlert(result.error || result.message || 'Erreur lors de l\'import', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showAlert('Erreur lors de l\'upload', 'error');
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded, creating app instance...');
    app = new App();
    window.app = app; // Make it globally accessible
});
