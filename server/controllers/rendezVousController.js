const pool = require('../config/database');

exports.addRendezVous = async (req, res) => {
    try {
        const { idMed, idPa, dateRV, heure, motif } = req.body;

        if (!idMed || !idPa || !dateRV || !heure) {
            return res.status(400).json({ success: false, message: 'Champs requis manquants' });
        }

        const connection = await pool.getConnection();

        // Vérifier qu'il n'y a pas de conflit
        const [existing] = await connection.query(
            'SELECT * FROM rendez_vous WHERE idMed = ? AND dateRV = ? AND heure = ?',
            [idMed, dateRV, heure]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Ce créneau est déjà réservé' });
        }

        const [result] = await connection.query(
            'INSERT INTO rendez_vous (idMed, idPa, dateRV, heure, motif, statut) VALUES (?, ?, ?, ?, ?, ?)',
            [idMed, idPa, dateRV, heure, motif || null, 'planifié']
        );

        connection.release();
        res.json({ success: true, message: 'Rendez-vous ajouté', id: result.insertId });
    } catch (error) {
        console.error('Erreur add RV:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getRendezVous = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rdvs] = await connection.query(`
            SELECT rv.*, m.nom as nom_medecin, m.prenom as prenom_medecin, 
                   p.nom as nom_patient, p.prenom as prenom_patient
            FROM rendez_vous rv
            JOIN medecins m ON rv.idMed = m.idMed
            JOIN patients p ON rv.idPa = p.idPa
            ORDER BY rv.dateRV DESC
        `);
        connection.release();
        res.json({ success: true, rendezVous: rdvs });
    } catch (error) {
        console.error('Erreur get RV:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getDoctorSchedule = async (req, res) => {
    try {
        const { idMed } = req.params;
        const connection = await pool.getConnection();
        
        const [rdvs] = await connection.query(`
            SELECT rv.*, p.nom as nom_patient, p.prenom as prenom_patient
            FROM rendez_vous rv
            JOIN patients p ON rv.idPa = p.idPa
            WHERE rv.idMed = ?
            ORDER BY rv.dateRV DESC
        `, [idMed]);
        
        connection.release();
        res.json({ success: true, rendezVous: rdvs });
    } catch (error) {
        console.error('Erreur get doctor schedule:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getRendezVousById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rdvs] = await connection.query(`
            SELECT rv.*, m.nom as nom_medecin, m.prenom as prenom_medecin,
                   p.nom as nom_patient, p.prenom as prenom_patient
            FROM rendez_vous rv
            JOIN medecins m ON rv.idMed = m.idMed
            JOIN patients p ON rv.idPa = p.idPa
            WHERE rv.idRV = ?
        `, [id]);
        connection.release();

        if (rdvs.length === 0) {
            return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
        }

        res.json({ success: true, rendezVous: rdvs[0] });
    } catch (error) {
        console.error('Erreur get RV:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.updateRendezVous = async (req, res) => {
    try {
        const { id } = req.params;
        const { idMed, idPa, dateRV, heure, motif, statut } = req.body;

        const connection = await pool.getConnection();

        // Vérifier s'il existe un conflit
        const [existing] = await connection.query(
            'SELECT * FROM rendez_vous WHERE idMed = ? AND dateRV = ? AND heure = ? AND idRV != ?',
            [idMed, dateRV, heure, id]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Ce créneau est déjà réservé' });
        }

        await connection.query(
            'UPDATE rendez_vous SET idMed = ?, idPa = ?, dateRV = ?, heure = ?, motif = ?, statut = ? WHERE idRV = ?',
            [idMed, idPa, dateRV, heure, motif, statut, id]
        );

        connection.release();
        res.json({ success: true, message: 'Rendez-vous modifié' });
    } catch (error) {
        console.error('Erreur update RV:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.deleteRendezVous = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM rendez_vous WHERE idRV = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Rendez-vous supprimé' });
    } catch (error) {
        console.error('Erreur delete RV:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { idMed } = req.params;
        const { date } = req.query;

        const connection = await pool.getConnection();
        const [booked] = await connection.query(
            'SELECT heure FROM rendez_vous WHERE idMed = ? AND DATE(dateRV) = ?',
            [idMed, date]
        );

        connection.release();

        const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                       '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
        
        const bookedSlots = booked.map(b => b.heure);
        const available = slots.filter(slot => !bookedSlots.includes(slot));

        res.json({ success: true, available });
    } catch (error) {
        console.error('Erreur get available slots:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
