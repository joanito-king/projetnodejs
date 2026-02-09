-- Créer la base de données
CREATE DATABASE IF NOT EXISTS gestion_rv;
USE gestion_rv;

-- Table secretaires
CREATE TABLE IF NOT EXISTS secretaires (
    idSec INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    login VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table medecins
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

-- Table patients
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

-- Table rendez_vous
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

-- Table demandes_modification
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

-- Table notifications
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

-- Insérer les données initiales
-- Passwords: Danty (hashed avec bcryptjs)
INSERT INTO secretaires (nom, prenom, login, password, email) VALUES
('Mbappé', 'Kylian', 'Mbappé', '$2a$10$YZVvh6xf9KVEpGFhKULjre.7CQCPKbNkqvTwBXkzDy8YZ8dQ0kXhK', 'mbappe@clinic.fr');

INSERT INTO medecins (nom, prenom, specialite, login, password, email, tel) VALUES
('Haaland', 'Erling', 'Cardiologue', 'Haaland', '$2a$10$YZVvh6xf9KVEpGFhKULjre.7CQCPKbNkqvTwBXkzDy8YZ8dQ0kXhK', 'haaland@clinic.fr', '0123456789'),
('Modric', 'Luka', 'Neurologue', 'Modric', '$2a$10$YZVvh6xf9KVEpGFhKULjre.7CQCPKbNkqvTwBXkzDy8YZ8dQ0kXhK', 'modric@clinic.fr', '0123456788'),
('Benzema', 'Karim', 'Généraliste', 'Benzema', '$2a$10$YZVvh6xf9KVEpGFhKULjre.7CQCPKbNkqvTwBXkzDy8YZ8dQ0kXhK', 'benzema@clinic.fr', '0123456787');

INSERT INTO patients (nom, prenom, age, sexe, tel, email, adresse) VALUES
('Ronaldo', 'Cristiano', 45, 'M', '0612345678', 'ronaldo@email.fr', '123 Rue de la Victoire'),
('Messi', 'Lionel', 28, 'M', '0612345679', 'messi@email.fr', '124 Rue de l''Inter'),
('Neymar', 'Santos', 32, 'M', '0612345680', 'neymar@email.fr', '125 Rue du Brésil'),
('Griezmann', 'Antoine', 40, 'M', '0612345681', 'griezmann@email.fr', '126 Rue de l''Atletico'),
('Vinicius', 'Junior', 35, 'M', '0612345682', 'vinicius@email.fr', '127 Rue du Real');
