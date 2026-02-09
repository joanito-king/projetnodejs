const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
    let connection;
    try {
        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
        });

        console.log('✓ Connecté à MySQL');

        // Sélectionner la base de données
        await connection.query('USE gestion_rv');
        console.log('✓ Base de données "gestion_rv" sélectionnée');

        // Récupérer tous les noms de tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✓ ${tables.length} table(s) trouvée(s)`);

        let sqlExport = '-- Export Database gestion_rv\n';
        sqlExport += `-- Date: ${new Date().toISOString()}\n\n`;
        sqlExport += 'CREATE DATABASE IF NOT EXISTS gestion_rv;\n';
        sqlExport += 'USE gestion_rv;\n\n';

        // Exporter chaque table
        for (const table of tables) {
            const tableName = table[Object.keys(table)[0]];
            console.log(`  Exporting table: ${tableName}...`);

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

        // Écrire dans le fichier
        const filePath = path.join(__dirname, 'backup_database.sql');
        fs.writeFileSync(filePath, sqlExport, 'utf8');
        console.log(`\n✅ Export réussi! Fichier créé: ${filePath}`);
        console.log(`📊 Taille du fichier: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

exportDatabase();
