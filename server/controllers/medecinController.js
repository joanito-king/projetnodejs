const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.addMedecin = async (req, res) => {
    try {
        const { nom, prenom, specialite, login, password, email, tel } = req.body;

        if (!nom || !prenom || !login || !password) {
            return res.status(400).json({ success: false, message: 'Tous les champs requis' });
        }

        // Validation email
        if (email && !email.endsWith('@clinic.fr')) {
            return res.status(400).json({ success: false, message: 'L\'email doit se terminer par @clinic.fr' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.query(
                'INSERT INTO medecins (nom, prenom, specialite, login, password, email, tel) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nom, prenom, specialite || null, login, hashedPassword, email || null, tel || null]
            );

            connection.release();
            res.json({ success: true, message: 'Médecin ajouté', id: result.insertId });
        } catch (error) {
            connection.release();
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ success: false, message: 'Login déjà utilisé' });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Erreur add medecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getMedecins = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [medecins] = await connection.query('SELECT idMed, nom, prenom, specialite, email, tel, created_at FROM medecins ORDER BY created_at DESC');
        connection.release();
        res.json({ success: true, medecins });
    } catch (error) {
        console.error('Erreur get medecins:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getMedecinById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [medecins] = await connection.query(
            'SELECT idMed, nom, prenom, specialite, email, tel, login FROM medecins WHERE idMed = ?',
            [id]
        );
        connection.release();

        if (medecins.length === 0) {
            return res.status(404).json({ success: false, message: 'Médecin non trouvé' });
        }

        res.json({ success: true, medecin: medecins[0] });
    } catch (error) {
        console.error('Erreur get medecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.updateMedecin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, specialite, email, tel, login, password } = req.body;

        // Validation email
        if (email && !email.endsWith('@clinic.fr')) {
            return res.status(400).json({ success: false, message: 'L\'email doit se terminer par @clinic.fr' });
        }

        const connection = await pool.getConnection();

        // Si le password est fourni, le hasher
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(
                'UPDATE medecins SET nom = ?, prenom = ?, specialite = ?, email = ?, tel = ?, login = ?, password = ? WHERE idMed = ?',
                [nom, prenom, specialite, email, tel, login, hashedPassword, id]
            );
        } else {
            // Si pas de password, mettre à jour les autres champs
            await connection.query(
                'UPDATE medecins SET nom = ?, prenom = ?, specialite = ?, email = ?, tel = ?, login = ? WHERE idMed = ?',
                [nom, prenom, specialite, email, tel, login, id]
            );
        }

        connection.release();
        res.json({ success: true, message: 'Médecin modifié' });
    } catch (error) {
        console.error('Erreur update medecin:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Ce login est déjà utilisé' });
        } else {
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }
};

exports.deleteMedecin = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM medecins WHERE idMed = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Médecin supprimé' });
    } catch (error) {
        console.error('Erreur delete medecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.searchMedecins = async (req, res) => {
    try {
        const { search } = req.params;
        const connection = await pool.getConnection();
        const [medecins] = await connection.query(
            'SELECT idMed, nom, prenom, specialite, email, tel FROM medecins WHERE nom LIKE ? OR prenom LIKE ? OR specialite LIKE ? OR tel LIKE ?',
            [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
        );
        connection.release();
        res.json({ success: true, medecins });
    } catch (error) {
        console.error('Erreur search medecins:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
