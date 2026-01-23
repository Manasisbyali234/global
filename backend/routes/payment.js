const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');

router.get('/key', auth(['candidate', 'employer']), paymentController.getPublicKey);
router.post('/create-order', auth(['candidate', 'employer']), paymentController.createOrder);
router.post('/verify-payment', auth(['candidate']), paymentController.verifyPayment);
router.post('/apply-with-credits', auth(['candidate']), paymentController.applyWithCredits);
router.post('/verify-credit-payment', auth(['candidate']), paymentController.verifyCreditPayment);
router.get('/employer-transactions', auth(['employer']), paymentController.getEmployerTransactions);
router.get('/candidate-transactions', auth(['candidate']), paymentController.getCandidateTransactions);
router.get('/all-transactions', auth(['admin']), paymentController.getAllTransactions);
router.get('/details/:paymentId', auth(['employer', 'admin', 'candidate']), paymentController.getPaymentDetails);

module.exports = router;
