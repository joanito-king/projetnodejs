const pool = require('../config/database');

exports.submitRequest = async (req, res) => {
    try {
        const { idRV, nouvelle_date, nouvelle_heure, motif } = req.body;
        const idMed = req.user.id;

        if (!idRV || !nouvelle_date || !nouvelle_heure) {
            return res.status(400).json({ success: false, message: 'Champs requis manquants' });
        }

        const connection = await pool.getConnection();

        // Vérifier que c'est bien le RV du médecin
        const [rvs] = await connection.query('SELECT * FROM rendez_vous WHERE idRV = ? AND idMed = ?', [idRV, idMed]);

        if (rvs.length === 0) {
            connection.release();
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        // Vérifier qu'il n'existe pas déjà une demande pour ce RV
        const [existing] = await connection.query(
            'SELECT * FROM demandes_modification WHERE idRV = ? AND statut = ?',
            [idRV, 'en attente']
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Une demande est déjà en attente pour ce RV' });
        }

        const [result] = await connection.query(
            'INSERT INTO demandes_modification (idMed, idRV, nouvelle_date, nouvelle_heure, motif, statut) VALUES (?, ?, ?, ?, ?, ?)',
            [idMed, idRV, nouvelle_date, nouvelle_heure, motif || null, 'en attente']
        );

        connection.release();
        res.json({ success: true, message: 'Demande de modification envoyée', id: result.insertId });
    } catch (error) {
        console.error('Erreur submit request:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [demandes] = await connection.query(`
            SELECT d.*, m.nom as nom_medecin, m.prenom as prenom_medecin,
                   rv.dateRV, rv.heure, p.nom as nom_patient, p.prenom as prenom_patient
            FROM demandes_modification d
            JOIN medecins m ON d.idMed = m.idMed
            JOIN rendez_vous rv ON d.idRV = rv.idRV
            JOIN patients p ON rv.idPa = p.idPa
            WHERE d.statut = 'en attente'
            ORDER BY d.created_at DESC
        `);
        connection.release();
        res.json({ success: true, demandes });
    } catch (error) {
        console.error('Erreur get pending requests:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { idDemande } = req.params;
        const connection = await pool.getConnection();

        // Récupérer la demande
        const [demandes] = await connection.query('SELECT * FROM demandes_modification WHERE idDemande = ?', [idDemande]);

        if (demandes.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        const demande = demandes[0];

        // Vérifier qu'il n'y a pas de conflit
        const [existing] = await connection.query(
            'SELECT * FROM rendez_vous WHERE idMed = ? AND dateRV = ? AND heure = ? AND idRV != ?',
            [demande.idMed, demande.nouvelle_date, demande.nouvelle_heure, demande.idRV]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Ce créneau est maintenant occupé' });
        }

        // Mettre à jour le RV
        await connection.query(
            'UPDATE rendez_vous SET dateRV = ?, heure = ? WHERE idRV = ?',
            [demande.nouvelle_date, demande.nouvelle_heure, demande.idRV]
        );

        // Mettre à jour le statut de la demande
        await connection.query(
            'UPDATE demandes_modification SET statut = ? WHERE idDemande = ?',
            ['acceptée', idDemande]
        );

        connection.release();
        res.json({ success: true, message: 'Demande acceptée et RV modifié' });
    } catch (error) {
        console.error('Erreur accept request:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { idDemande } = req.params;
        const connection = await pool.getConnection();

        await connection.query(
            'UPDATE demandes_modification SET statut = ? WHERE idDemande = ?',
            ['refusée', idDemande]
        );

        connection.release();
        res.json({ success: true, message: 'Demande refusée' });
    } catch (error) {
        console.error('Erreur reject request:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getDoctorRequests = async (req, res) => {
    try {
        const { idMed } = req.params;
        const connection = await pool.getConnection();

        const [demandes] = await connection.query(`
            SELECT d.*, rv.dateRV, rv.heure, p.nom as nom_patient, p.prenom as prenom_patient
            FROM demandes_modification d
            JOIN rendez_vous rv ON d.idRV = rv.idRV
            JOIN patients p ON rv.idPa = p.idPa
            WHERE d.idMed = ?
            ORDER BY d.created_at DESC
        `, [idMed]);

        connection.release();
        res.json({ success: true, demandes });
    } catch (error) {
        console.error('Erreur get doctor requests:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
