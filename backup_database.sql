-- Export Database gestion_rv
-- Date: 2026-02-06T11:13:44.264Z

CREATE DATABASE IF NOT EXISTS gestion_rv;
USE gestion_rv;

DROP TABLE IF EXISTS demandes_modification;
CREATE TABLE `demandes_modification` (
  `idDemande` int(11) NOT NULL AUTO_INCREMENT,
  `idMed` int(11) NOT NULL,
  `idRV` int(11) NOT NULL,
  `nouvelle_date` datetime DEFAULT NULL,
  `nouvelle_heure` varchar(10) DEFAULT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'en attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idDemande`),
  KEY `idMed` (`idMed`),
  KEY `idRV` (`idRV`),
  CONSTRAINT `demandes_modification_ibfk_1` FOREIGN KEY (`idMed`) REFERENCES `medecins` (`idMed`) ON DELETE CASCADE,
  CONSTRAINT `demandes_modification_ibfk_2` FOREIGN KEY (`idRV`) REFERENCES `rendez_vous` (`idRV`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO demandes_modification (idDemande, idMed, idRV, nouvelle_date, nouvelle_heure, motif, statut, created_at) VALUES (4, 12, 11, '2026-09-09T00:00:00.000Z', '23:49', 'Daanty a mal a la tete', 'acceptée', '2026-02-05T16:34:19.000Z');

DROP TABLE IF EXISTS medecins;
CREATE TABLE `medecins` (
  `idMed` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `specialite` varchar(100) DEFAULT NULL,
  `login` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMed`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO medecins (idMed, nom, prenom, specialite, login, password, email, tel, created_at) VALUES (12, 'Haaland', 'Erling', 'Cardiologue', 'Haaland', '$2a$10$tzCz84VOsu5ZOtt6799asOsSg98ozDLOFI5I1g7k/2.SwRR44JRgG', 'haaland@clinic.fr', '0123456789', '2026-02-05T10:49:46.000Z');
INSERT INTO medecins (idMed, nom, prenom, specialite, login, password, email, tel, created_at) VALUES (13, 'Modric', 'Luka', 'Neurologue', 'Modric', '$2a$10$/Q8hKA2UaIpnEQ6/VVzxPenOf5ZrZOMwV1GE.ygHgAcAam8yHAYoS', 'modric@clinic.fr', '0123456788', '2026-02-05T10:49:46.000Z');
INSERT INTO medecins (idMed, nom, prenom, specialite, login, password, email, tel, created_at) VALUES (14, 'Benzema', 'Karim', 'Généraliste', 'Benzema', '$2a$10$gW7XhTYw1rjywF993O22je7fvieWeJl9qdkDttG3DZSMYeBnpFZiW', 'benzema@clinic.fr', '0123456787', '2026-02-05T10:49:46.000Z');
INSERT INTO medecins (idMed, nom, prenom, specialite, login, password, email, tel, created_at) VALUES (15, 'danty', 'Diop', 'Dentiste', 'Diop', '$2a$10$9YSD16/X8ZGJsJi61wJ4ZO6PVFmJKqmVgi/tWiuncgnRahdcfzSoW', 'dnatydiop@clinic.fr', '0987654321', '2026-02-05T16:32:21.000Z');

DROP TABLE IF EXISTS messages;
CREATE TABLE `messages` (
  `idMsg` int(11) NOT NULL AUTO_INCREMENT,
  `idSec` int(11) DEFAULT NULL,
  `idMed` int(11) DEFAULT NULL,
  `sender_type` varchar(20) NOT NULL,
  `contenu` varchar(1000) NOT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMsg`),
  KEY `idMed` (`idMed`),
  KEY `idx_conversation` (`idSec`,`idMed`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`idSec`) REFERENCES `secretaires` (`idSec`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`idMed`) REFERENCES `medecins` (`idMed`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS notifications;
CREATE TABLE `notifications` (
  `idNotif` int(11) NOT NULL AUTO_INCREMENT,
  `idSec` int(11) DEFAULT NULL,
  `idMed` int(11) DEFAULT NULL,
  `message` varchar(500) DEFAULT NULL,
  `lue` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idNotif`),
  KEY `idSec` (`idSec`),
  KEY `idMed` (`idMed`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`idSec`) REFERENCES `secretaires` (`idSec`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`idMed`) REFERENCES `medecins` (`idMed`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS patients;
CREATE TABLE `patients` (
  `idPa` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `sexe` varchar(10) DEFAULT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idPa`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO patients (idPa, nom, prenom, age, sexe, tel, email, adresse, created_at) VALUES (13, 'Ronaldo', 'Cristiano', 45, 'M', '0612345678', 'ronaldo@email.fr', '123 Rue de la Victoire', '2026-02-05T10:49:46.000Z');
INSERT INTO patients (idPa, nom, prenom, age, sexe, tel, email, adresse, created_at) VALUES (14, 'Messi', 'Lionel', 28, 'M', '0612345679', 'messi@email.fr', '124 Rue de l''Inter', '2026-02-05T10:49:46.000Z');
INSERT INTO patients (idPa, nom, prenom, age, sexe, tel, email, adresse, created_at) VALUES (15, 'Neymar', 'Santos', 32, 'M', '0612345680', 'neymar@email.fr', '125 Rue du Brésil', '2026-02-05T10:49:46.000Z');
INSERT INTO patients (idPa, nom, prenom, age, sexe, tel, email, adresse, created_at) VALUES (16, 'Griezmann', 'Antoine', 40, 'M', '0612345681', 'griezmann@email.fr', '126 Rue de l''Atletico', '2026-02-05T10:49:46.000Z');
INSERT INTO patients (idPa, nom, prenom, age, sexe, tel, email, adresse, created_at) VALUES (17, 'Vinicius', 'Junior', 35, 'M', '0612345682', 'vinicius@email.fr', '127 Rue du Real', '2026-02-05T10:49:46.000Z');

DROP TABLE IF EXISTS rendez_vous;
CREATE TABLE `rendez_vous` (
  `idRV` int(11) NOT NULL AUTO_INCREMENT,
  `idMed` int(11) NOT NULL,
  `idPa` int(11) NOT NULL,
  `dateRV` datetime NOT NULL,
  `heure` varchar(10) NOT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'planifié',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idRV`),
  UNIQUE KEY `unique_rv` (`idMed`,`dateRV`,`heure`),
  KEY `idPa` (`idPa`),
  CONSTRAINT `rendez_vous_ibfk_1` FOREIGN KEY (`idMed`) REFERENCES `medecins` (`idMed`) ON DELETE CASCADE,
  CONSTRAINT `rendez_vous_ibfk_2` FOREIGN KEY (`idPa`) REFERENCES `patients` (`idPa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO rendez_vous (idRV, idMed, idPa, dateRV, heure, motif, statut, created_at) VALUES (10, 12, 13, '2026-02-08T10:49:46.000Z', '09:00', 'Consultation cardiaque', 'planifié', '2026-02-05T10:49:46.000Z');
INSERT INTO rendez_vous (idRV, idMed, idPa, dateRV, heure, motif, statut, created_at) VALUES (11, 12, 14, '2026-09-09T00:00:00.000Z', '23:49', 'Suivi tension', 'planifié', '2026-02-05T10:49:46.000Z');
INSERT INTO rendez_vous (idRV, idMed, idPa, dateRV, heure, motif, statut, created_at) VALUES (12, 13, 15, '2026-02-10T10:49:46.000Z', '14:00', 'Consultation neurologique', 'planifié', '2026-02-05T10:49:46.000Z');
INSERT INTO rendez_vous (idRV, idMed, idPa, dateRV, heure, motif, statut, created_at) VALUES (13, 14, 16, '2026-02-11T10:49:46.000Z', '15:30', 'Visite générale', 'planifié', '2026-02-05T10:49:46.000Z');

DROP TABLE IF EXISTS secretaires;
CREATE TABLE `secretaires` (
  `idSec` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `login` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idSec`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO secretaires (idSec, nom, prenom, login, password, email, created_at) VALUES (4, 'Mbappé', 'Kylian', 'Mbappé', '$2a$10$5etniq8wYmi1W6X2j6Zpi.aHZ2ilUxxxpEv/CIKEdlfzX/LMH38Li', 'mbappe@clinic.fr', '2026-02-05T10:49:46.000Z');

