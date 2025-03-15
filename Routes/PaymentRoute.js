const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, createPayment);

module.exports = router;
