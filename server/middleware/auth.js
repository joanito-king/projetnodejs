const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token non fourni' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

const verifySecretary = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'secretaire') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Accès réservé aux secrétaires' });
        }
    });
};

const verifyDoctor = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'medecin') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Accès réservé aux médecins' });
        }
    });
};

module.exports = { verifyToken, verifySecretary, verifyDoctor };
