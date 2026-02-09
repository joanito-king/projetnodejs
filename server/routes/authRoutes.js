const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register-secretary', authController.registerSecretary);
router.post('/register-doctor', authController.registerDoctor);
router.get('/verify', authController.verifyToken);

module.exports = router;
