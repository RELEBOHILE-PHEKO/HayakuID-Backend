// PaymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');

if (!process.env.STRIPE_SECRET) {
    throw new Error('STRIPE_SECRET is not defined');
}

const createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than zero.' });
        }

        if (!validCurrency(currency)) {
            return res.status(400).json({ error: 'Invalid currency. Must be ZAR or LSL.' });
        }

        const paymentIntent = await createPaymentIntent(amount, currency);
        const payment = await createPaymentRecord(amount, currency, req.user.id, paymentIntent.id);

        res.json({ clientSecret: paymentIntent.client_secret, payment });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: error.message });
    }
};

const validCurrency = (currency) => {
    return ['ZAR', 'LSL'].includes(currency);
};

const createPaymentIntent = async (amount, currency) => {
    return await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
    });
};

const createPaymentRecord = async (amount, currency, userId, paymentIntentId) => {
    try {
        const payment = new Payment({
            userId,
            amount,
            currency,
            stripePaymentId: paymentIntentId,
            status: 'pending',
        });
        return await payment.save();
    } catch (error) {
        throw new Error('Failed to save payment: ' + error.message);
    }
};

// Export the functions
module.exports = {
    createPayment,
    validCurrency,
    createPaymentIntent,
    createPaymentRecord,
};