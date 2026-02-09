const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
let upload;
// Préparer dossier d'uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
try {
    const multer = require('multer');
    upload = multer({ dest: uploadsDir });
} catch (err) {
    console.warn('module multer introuvable — les routes d\'import ne seront pas actives.');
    // Stub qui laisse passer les requêtes mais retourne une erreur si on tente d'uploader
    upload = {
        single: () => (req, res, next) => {
            res.status(501).json({ error: 'Upload non disponible: module multer manquant sur le système.' });
        }
    };
}

// Route pour exporter la base de données
router.get('/database', async (req, res) => {
    let connection;
    try {
        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
        });

        // Sélectionner la base de données
        await connection.query('USE gestion_rv');

        // Récupérer tous les noms de tables
        const [tables] = await connection.query('SHOW TABLES');

        let sqlExport = '-- Export Database gestion_rv\n';
        sqlExport += `-- Date: ${new Date().toISOString()}\n\n`;
        sqlExport += 'CREATE DATABASE IF NOT EXISTS gestion_rv;\n';
        sqlExport += 'USE gestion_rv;\n\n';

        // Exporter chaque table
        for (const table of tables) {
            const tableName = table[Object.keys(table)[0]];

            // Récupérer la structure CREATE TABLE
            const [createTableResult] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
            sqlExport += `DROP TABLE IF EXISTS ${tableName};\n`;
            sqlExport += createTableResult[0]['Create Table'] + ';\n\n';

            // Récupérer les données
            const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
            
            if (rows.length > 0) {
                const columns = Object.keys(rows[0]);
                for (const row of rows) {
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        if (value instanceof Date) return `'${value.toISOString()}'`;
                        return value;
                    });
                    sqlExport += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                }
                sqlExport += '\n';
            }
        }

        // Générer le nom du fichier avec la date
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        const filename = `backup_gestion_rv_${dateStr}_${timeStr}.sql`;

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(sqlExport);

        console.log(`✓ Backup téléchargé : ${filename}`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error.message);
        res.status(500).json({ 
            error: 'Erreur lors de l\'export de la base de données',
            details: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;

// Route pour importer un fichier SQL (upload)
router.post('/import', upload.single('sqlfile'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

        const filePath = req.file.path;
        const sql = fs.readFileSync(filePath, 'utf8');

        // Connexion à MySQL avec multipleStatements pour exécuter plusieurs commandes
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        // Exécuter le SQL (peut contenir CREATE DATABASE / USE / INSERT ...)
        await connection.query(sql);

        // Supprimer le fichier uploadé
        fs.unlinkSync(filePath);

        console.log('✓ Import SQL exécuté avec succès');
        res.json({ success: true, message: 'Import réalisé avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error.message);
        res.status(500).json({ error: 'Erreur lors de l\'import du fichier SQL', details: error.message });
    } finally {
        if (connection) await connection.end();
    }
});
