const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ success: false, message: 'Login et mot de passe requis' });
        }

        const connection = await pool.getConnection();
        
        // Vérifier d'abord dans secretaires
        let [secretaires] = await connection.query('SELECT * FROM secretaires WHERE login = ?', [login]);
        
        if (secretaires.length > 0) {
            const secretaire = secretaires[0];
            const match = await bcrypt.compare(password, secretaire.password);
            
            if (match) {
                const token = jwt.sign(
                    {
                        id: secretaire.idSec,
                        role: 'secretaire',
                        nom: secretaire.nom,
                        prenom: secretaire.prenom
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                connection.release();
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: secretaire.idSec,
                        role: 'secretaire',
                        nom: secretaire.nom,
                        prenom: secretaire.prenom
                    }
                });
            }
        }

        // Vérifier dans medecins
        let [medecins] = await connection.query('SELECT * FROM medecins WHERE login = ?', [login]);
        
        if (medecins.length > 0) {
            const medecin = medecins[0];
            const match = await bcrypt.compare(password, medecin.password);
            
            if (match) {
                const token = jwt.sign(
                    {
                        id: medecin.idMed,
                        role: 'medecin',
                        nom: medecin.nom,
                        prenom: medecin.prenom
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                connection.release();
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: medecin.idMed,
                        role: 'medecin',
                        nom: medecin.nom,
                        prenom: medecin.prenom
                    }
                });
            }
        }

        connection.release();
        res.status(401).json({ success: false, message: 'Identifiants invalides' });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.registerSecretary = async (req, res) => {
    try {
        const { nom, prenom, login, password, email } = req.body;

        if (!nom || !prenom || !login || !password) {
            return res.status(400).json({ success: false, message: 'Tous les champs requis' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO secretaires (nom, prenom, login, password, email) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, login, hashedPassword, email]
        );

        connection.release();
        res.json({ success: true, message: 'Secrétaire créée avec succès' });
    } catch (error) {
        console.error('Erreur register secretary:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Login déjà utilisé' });
        } else {
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }
};

exports.registerDoctor = async (req, res) => {
    try {
        const { nom, prenom, specialite, login, password, email, tel } = req.body;

        if (!nom || !prenom || !login || !password) {
            return res.status(400).json({ success: false, message: 'Tous les champs requis' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO medecins (nom, prenom, specialite, login, password, email, tel) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, prenom, specialite, login, hashedPassword, email, tel]
        );

        connection.release();
        res.json({ success: true, message: 'Médecin créé avec succès' });
    } catch (error) {
        console.error('Erreur register doctor:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Login déjà utilisé' });
        } else {
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }
};

exports.verifyToken = (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ success: false });
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ success: false });
    }
};
