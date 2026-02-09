const pool = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
    const connection = await pool.getConnection();

    try {
        // Créer la base de données
        const dbName = process.env.DB_NAME || 'gestion_rv';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        await connection.query(`USE ${dbName}`);

        // Créer les tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS secretaires (
                idSec INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                login VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS medecins (
                idMed INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                specialite VARCHAR(100),
                login VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                tel VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS patients (
                idPa INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                age INT,
                sexe VARCHAR(10),
                tel VARCHAR(20),
                email VARCHAR(100),
                adresse VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS rendez_vous (
                idRV INT AUTO_INCREMENT PRIMARY KEY,
                idMed INT NOT NULL,
                idPa INT NOT NULL,
                dateRV DATETIME NOT NULL,
                heure VARCHAR(10) NOT NULL,
                motif VARCHAR(255),
                statut VARCHAR(50) DEFAULT 'planifié',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idMed) REFERENCES medecins(idMed) ON DELETE CASCADE,
                FOREIGN KEY (idPa) REFERENCES patients(idPa) ON DELETE CASCADE,
                UNIQUE KEY unique_rv (idMed, dateRV, heure)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS demandes_modification (
                idDemande INT AUTO_INCREMENT PRIMARY KEY,
                idMed INT NOT NULL,
                idRV INT NOT NULL,
                nouvelle_date DATETIME,
                nouvelle_heure VARCHAR(10),
                motif VARCHAR(255),
                statut VARCHAR(50) DEFAULT 'en attente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idMed) REFERENCES medecins(idMed) ON DELETE CASCADE,
                FOREIGN KEY (idRV) REFERENCES rendez_vous(idRV) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                idNotif INT AUTO_INCREMENT PRIMARY KEY,
                idSec INT,
                idMed INT,
                message VARCHAR(500),
                lue BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idSec) REFERENCES secretaires(idSec) ON DELETE CASCADE,
                FOREIGN KEY (idMed) REFERENCES medecins(idMed) ON DELETE CASCADE
            )
        `);

        console.log('✓ Tables créées');

        // Hash passwords
        const hashPassword = async (password) => bcrypt.hash(password, 10);

        // Delete existing data
        await connection.query('DELETE FROM demandes_modification');
        await connection.query('DELETE FROM rendez_vous');
        await connection.query('DELETE FROM notifications');
        await connection.query('DELETE FROM patients');
        await connection.query('DELETE FROM medecins');
        await connection.query('DELETE FROM secretaires');
        
        console.log('Ajout des données initiales...');

            // Add Secretaires
            const secretaires = [
                { nom: 'Mbappé', prenom: 'Kylian', login: 'Mbappé', password: 'Danty', email: 'mbappe@clinic.fr' },
            ];

            for (const sec of secretaires) {
                const hashedPassword = await hashPassword(sec.password);
                await connection.query(
                    'INSERT INTO secretaires (nom, prenom, login, password, email) VALUES (?, ?, ?, ?, ?)',
                    [sec.nom, sec.prenom, sec.login, hashedPassword, sec.email]
                );
            }

            // Add Medecins
            const medecins = [
                { nom: 'Haaland', prenom: 'Erling', specialite: 'Cardiologue', login: 'Haaland', password: 'Danty', email: 'haaland@clinic.fr', tel: '0123456789' },
                { nom: 'Modric', prenom: 'Luka', specialite: 'Neurologue', login: 'Modric', password: 'Danty', email: 'modric@clinic.fr', tel: '0123456788' },
                { nom: 'Benzema', prenom: 'Karim', specialite: 'Généraliste', login: 'Benzema', password: 'Danty', email: 'benzema@clinic.fr', tel: '0123456787' },
            ];

            const medecinsIds = [];
            for (const med of medecins) {
                const hashedPassword = await hashPassword(med.password);
                const [result] = await connection.query(
                    'INSERT INTO medecins (nom, prenom, specialite, login, password, email, tel) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [med.nom, med.prenom, med.specialite, med.login, hashedPassword, med.email, med.tel]
                );
                medecinsIds.push(result.insertId);
            }

            // Add Patients
            const patients = [
                { nom: 'Ronaldo', prenom: 'Cristiano', age: 45, sexe: 'M', tel: '0612345678', email: 'ronaldo@email.fr', adresse: '123 Rue de la Victoire' },
                { nom: 'Messi', prenom: 'Lionel', age: 28, sexe: 'M', tel: '0612345679', email: 'messi@email.fr', adresse: '124 Rue de l\'Inter' },
                { nom: 'Neymar', prenom: 'Santos', age: 32, sexe: 'M', tel: '0612345680', email: 'neymar@email.fr', adresse: '125 Rue du Brésil' },
                { nom: 'Griezmann', prenom: 'Antoine', age: 40, sexe: 'M', tel: '0612345681', email: 'griezmann@email.fr', adresse: '126 Rue de l\'Atletico' },
                { nom: 'Vinicius', prenom: 'Junior', age: 35, sexe: 'M', tel: '0612345682', email: 'vinicius@email.fr', adresse: '127 Rue du Real' },
            ];

            const patientsIds = [];
            for (const pat of patients) {
                const [result] = await connection.query(
                    'INSERT INTO patients (nom, prenom, age, sexe, tel, email, adresse) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [pat.nom, pat.prenom, pat.age, pat.sexe, pat.tel, pat.email, pat.adresse]
                );
                patientsIds.push(result.insertId);
            }

            // Add sample Rendez-vous
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() + 3);

            const rendezVous = [
                { idMed: medecinsIds[0], idPa: patientsIds[0], dateRV: baseDate, heure: '09:00', motif: 'Consultation cardiaque' },
                { idMed: medecinsIds[0], idPa: patientsIds[1], dateRV: new Date(baseDate.getTime() + 86400000), heure: '10:30', motif: 'Suivi tension' },
                { idMed: medecinsIds[1], idPa: patientsIds[2], dateRV: new Date(baseDate.getTime() + 172800000), heure: '14:00', motif: 'Consultation neurologique' },
                { idMed: medecinsIds[2], idPa: patientsIds[3], dateRV: new Date(baseDate.getTime() + 259200000), heure: '15:30', motif: 'Visite générale' },
            ];

            for (const rv of rendezVous) {
                await connection.query(
                    'INSERT INTO rendez_vous (idMed, idPa, dateRV, heure, motif, statut) VALUES (?, ?, ?, ?, ?, ?)',
                    [rv.idMed, rv.idPa, rv.dateRV, rv.heure, rv.motif, 'planifié']
                );
            }

            console.log('✓ Données initiales ajoutées avec succès');
            console.log('\n=== IDENTIFIANTS DE CONNEXION ===\n');
            console.log('SECRÉTAIRE:');
            console.log('  Login: Mbappé');
            console.log('  Password: Danty\n');
            console.log('MÉDECINS:');
            console.log('  1. Login: Haaland');
            console.log('     Password: Danty');
            console.log('     Spécialité: Cardiologue\n');
            console.log('  2. Login: Modric');
            console.log('     Password: Danty');
            console.log('     Spécialité: Neurologue\n');
            console.log('  3. Login: Benzema');
            console.log('     Password: Danty');
            console.log('     Spécialité: Généraliste\n');

        connection.release();
    } catch (error) {
        console.error('Erreur lors du seed:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase();
