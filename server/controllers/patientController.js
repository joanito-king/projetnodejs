const pool = require('../config/database');

exports.addPatient = async (req, res) => {
    try {
        const { nom, prenom, age, sexe, tel, email, adresse } = req.body;

        if (!nom || !prenom) {
            return res.status(400).json({ success: false, message: 'Nom et prénom requis' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO patients (nom, prenom, age, sexe, tel, email, adresse) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, prenom, age || null, sexe || null, tel || null, email || null, adresse || null]
        );

        connection.release();
        res.json({ success: true, message: 'Patient ajouté', id: result.insertId });
    } catch (error) {
        console.error('Erreur add patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [patients] = await connection.query('SELECT * FROM patients ORDER BY created_at DESC');
        connection.release();
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Erreur get patients:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [patients] = await connection.query('SELECT * FROM patients WHERE idPa = ?', [id]);
        connection.release();

        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient non trouvé' });
        }

        res.json({ success: true, patient: patients[0] });
    } catch (error) {
        console.error('Erreur get patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, age, sexe, tel, email, adresse } = req.body;

        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE patients SET nom = ?, prenom = ?, age = ?, sexe = ?, tel = ?, email = ?, adresse = ? WHERE idPa = ?',
            [nom, prenom, age, sexe, tel, email, adresse, id]
        );

        connection.release();
        res.json({ success: true, message: 'Patient modifié' });
    } catch (error) {
        console.error('Erreur update patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM patients WHERE idPa = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Patient supprimé' });
    } catch (error) {
        console.error('Erreur delete patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.searchPatients = async (req, res) => {
    try {
        const { search } = req.params;
        const connection = await pool.getConnection();
        const [patients] = await connection.query(
            'SELECT * FROM patients WHERE nom LIKE ? OR prenom LIKE ? OR tel LIKE ?',
            [`%${search}%`, `%${search}%`, `%${search}%`]
        );
        connection.release();
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Erreur search patients:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
