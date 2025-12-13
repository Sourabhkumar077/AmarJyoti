const crypto = require("crypto");

// Values from your order creation response
const orderId = "order_RrBSKaIBTudHg2";       // razorpayOrderId
const paymentId = "pay_test_123456789";       // dummy/test paymentId
const secret = "RUqrGKoCCV7HcyV90DXf53vx";    // from your .env

// Generate signature
const signature = crypto
  .createHmac("sha256", secret)
  .update(orderId + "|" + paymentId)
  .digest("hex");

console.log("Signature:", signature);
