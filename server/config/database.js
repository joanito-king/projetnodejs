const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// Créer la base de données et les tables si elles n'existent pas
async function initializeDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Créer la base de données
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✓ Base de données '${process.env.DB_NAME}' créée/vérifiée`);
        
        // Sélectionner la base
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        // Créer les tables
        const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS secretaires (
                idSec INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                login VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

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
            );

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
            );

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
            );

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
            );

            CREATE TABLE IF NOT EXISTS notifications (
                idNotif INT AUTO_INCREMENT PRIMARY KEY,
                idSec INT,
                idMed INT,
                message VARCHAR(500),
                lue BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idSec) REFERENCES secretaires(idSec) ON DELETE CASCADE,
                FOREIGN KEY (idMed) REFERENCES medecins(idMed) ON DELETE CASCADE
            );
        `;

        await connection.query(createTablesSQL);
        
        // Vérifier et ajouter les données initiales
        const [secretairesCheck] = await connection.query('SELECT COUNT(*) as count FROM secretaires');
        
        if (secretairesCheck[0].count === 0) {
            console.log('✓ Ajout des données initiales...');
            
            const bcrypt = require('bcryptjs');
            const hashPassword = async (password) => bcrypt.hash(password, 10);
            
            // Ajouter secrétaire
            const hashedPass = await hashPassword('Danty');
            await connection.query(
                'INSERT INTO secretaires (nom, prenom, login, password, email) VALUES (?, ?, ?, ?, ?)',
                ['Martin', 'Sophie', 'Sophie', hashedPass, 'sophie@clinic.fr']
            );
            
            // Ajouter médecins
            const medecinsData = [
                { nom: 'Kakarot', prenom: 'Son', spec: 'Cardiologue', login: 'Goku', email: 'goku@clinic.fr', tel: '0123456789' },
                { nom: 'Briefs', prenom: 'Bulma', spec: 'Neurologue', login: 'Mouha', email: 'bulma@clinic.fr', tel: '0123456788' },
                { nom: 'Satan', prenom: 'Hercule', spec: 'Généraliste', login: 'Hercule', email: 'hercule@clinic.fr', tel: '0123456787' },
            ];
            
            for (const med of medecinsData) {
                const hash = await hashPassword('Danty');
                await connection.query(
                    'INSERT INTO medecins (nom, prenom, specialite, login, password, email, tel) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [med.nom, med.prenom, med.spec, med.login, hash, med.email, med.tel]
                );
            }
            
            // Ajouter patients
            const patientsData = [
                { nom: 'Vegeta', prenom: 'Prince', age: 45, sexe: 'M', tel: '0612345678', email: 'vegeta@email.fr', adr: '123 Rue du Prince' },
                { nom: 'Trunks', prenom: 'Jean', age: 28, sexe: 'M', tel: '0612345679', email: 'trunks@email.fr', adr: '124 Rue Future' },
            ];
            
            for (const pat of patientsData) {
                await connection.query(
                    'INSERT INTO patients (nom, prenom, age, sexe, tel, email, adresse) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [pat.nom, pat.prenom, pat.age, pat.sexe, pat.tel, pat.email, pat.adr]
                );
            }
            
            console.log('✓ Données initiales ajoutées');
        }
        
        console.log('✓ Base de données initialisée avec succès');
        return true;
    } catch (error) {
        console.error('✗ Erreur:', error.message);
        return false;
    } finally {
        if (connection) connection.release();
    }
}

initializeDatabase();

module.exports = pool;
