const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { verifySecretary, verifyDoctor } = require('../middleware/auth');

router.post('/request', verifyDoctor, demandeController.submitRequest);
router.get('/pending', verifySecretary, demandeController.getPendingRequests);
router.put('/:idDemande/accept', verifySecretary, demandeController.acceptRequest);
router.put('/:idDemande/reject', verifySecretary, demandeController.rejectRequest);
router.get('/doctor/:idMed', verifyDoctor, demandeController.getDoctorRequests);

module.exports = router;
