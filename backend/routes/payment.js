const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');

router.use(auth(['candidate']));

router.get('/key', paymentController.getPublicKey);
router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/verify-credit-payment', paymentController.verifyCreditPayment);

module.exports = router;
