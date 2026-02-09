const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const { verifySecretary, verifyDoctor, verifyToken } = require('../middleware/auth');

router.post('/add', verifySecretary, rendezVousController.addRendezVous);
router.get('/list', verifySecretary, rendezVousController.getRendezVous);
router.get('/doctor/:idMed', verifyDoctor, rendezVousController.getDoctorSchedule);
router.get('/:id', verifyToken, rendezVousController.getRendezVousById);
router.put('/:id', verifySecretary, rendezVousController.updateRendezVous);
router.delete('/:id', verifySecretary, rendezVousController.deleteRendezVous);
router.get('/available-slots/:idMed', verifySecretary, rendezVousController.getAvailableSlots);

module.exports = router;
