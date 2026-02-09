const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const { verifySecretary, verifyToken } = require('../middleware/auth');

router.post('/add', verifySecretary, medecinController.addMedecin);
router.get('/list', verifySecretary, medecinController.getMedecins);
router.get('/:id', verifyToken, medecinController.getMedecinById);
router.put('/:id', verifySecretary, medecinController.updateMedecin);
router.delete('/:id', verifySecretary, medecinController.deleteMedecin);
router.get('/search/:search', verifySecretary, medecinController.searchMedecins);

module.exports = router;
