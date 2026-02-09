const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifySecretary } = require('../middleware/auth');

router.post('/add', verifySecretary, patientController.addPatient);
router.get('/list', verifySecretary, patientController.getPatients);
router.get('/:id', verifySecretary, patientController.getPatientById);
router.put('/:id', verifySecretary, patientController.updatePatient);
router.delete('/:id', verifySecretary, patientController.deletePatient);
router.get('/search/:search', verifySecretary, patientController.searchPatients);

module.exports = router;
