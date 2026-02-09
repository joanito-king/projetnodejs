const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Anti-cache middleware pour le développement
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medecins', require('./routes/medecinRoutes'));
app.use('/api/rendezVous', require('./routes/rendezVousRoutes'));
app.use('/api/demandes', require('./routes/demandeRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Serve index.html for main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all for single page app
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;
