import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize admin SDK once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

setGlobalOptions({maxInstances: 10});

export {createCheckoutSession, stripeWebhook, createRefund} from "./stripe.js";
export {createPaymentIntent, finalizePaymentIntent} from "./paymentIntent.js";
export {createShippingLabel, verifyOrderAddresses, validateAddress, getShippingEstimate} from "./shippo.js";
export {mergeLabelsPdf} from "./pdfMerge.js";
