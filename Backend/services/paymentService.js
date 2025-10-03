const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

// Confirm payment
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

// Create refund
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

// Create customer
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};

// Get customer by ID
const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    throw new Error(`Customer retrieval failed: ${error.message}`);
  }
};

// PayPal integration (using PayPal REST API)
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment setup
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
  : new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );

const client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal order
const createPayPalOrder = async (orderData) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: orderData.total.toString(),
        },
        description: orderData.description || 'Bedsheet Store Purchase',
      }],
      application_context: {
        brand_name: 'Bedsheet Store',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: orderData.return_url,
        cancel_url: orderData.cancel_url,
      },
    });

    const order = await client.execute(request);
    return order.result;
  } catch (error) {
    throw new Error(`PayPal order creation failed: ${error.message}`);
  }
};

// Capture PayPal payment
const capturePayPalPayment = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);
    return capture.result;
  } catch (error) {
    throw new Error(`PayPal payment capture failed: ${error.message}`);
  }
};

module.exports = {
  // Stripe functions
  createPaymentIntent,
  confirmPayment,
  createRefund,
  createCustomer,
  getCustomer,

  // PayPal functions
  createPayPalOrder,
  capturePayPalPayment,
};