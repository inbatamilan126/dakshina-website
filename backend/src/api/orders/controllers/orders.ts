// File: backend/src/api/orders/controllers/orders.ts

'use strict';

import * as crypto from 'crypto';
const Razorpay = require('razorpay');
const Brevo = require('@getbrevo/brevo');

// Initialize the Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize the Brevo client
const brevoApi = new Brevo.TransactionalEmailsApi();
brevoApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

module.exports = {
  async create(ctx) {
    console.log("--- Create order endpoint reached ---");
    try {
      const { amount, eventIdentifier, tierName, quantity } = ctx.request.body;
      const options = {
        amount: amount,
        currency: "INR",
        receipt: `receipt_${eventIdentifier}_${Date.now()}`,
        notes: { 
          eventCode: eventIdentifier,
          tierName: tierName,
          quantity: quantity,
        }
      };
      const order = await razorpay.orders.create(options);
      if (!order) return ctx.badRequest("Order creation failed.");
      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return ctx.internalServerError("Could not create order.");
    }
  },

  async verify(ctx) {
    console.log("--- Verification endpoint reached by frontend ---");

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
    } = ctx.request.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return ctx.badRequest('Missing required payment details.');
    }

    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", KEY_SECRET).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("SIGNATURE MISMATCH: Payment verification failed.");
      return ctx.badRequest('Invalid payment signature');
    }

    console.log("Signature is valid. Processing order...");

    try {
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

      const userEmail = paymentDetails.email;
      const eventCode = orderDetails.notes.eventCode;
      const tierName = orderDetails.notes.tierName;
      const quantity = parseInt(orderDetails.notes.quantity, 10);

      if (!eventCode || !userEmail || !tierName || !quantity) {
        throw new Error("Could not find all required details in order notes.");
      }
      
      const events = await strapi.entityService.findMany('api::event.event', {
        filters: { uid: eventCode } as any,
        populate: '*',
      });

      const eventToUpdate = events?.[0];

      if (eventToUpdate) {
        const numericEventId = eventToUpdate.id;

        // --- NEW LOGIC: Update the specific ticket tier by the purchased quantity ---
        const tierIndex = (eventToUpdate as any).ticket_tiers.findIndex(t => t.name === tierName);

        if (tierIndex > -1) {
          const updatedTiers = JSON.parse(JSON.stringify((eventToUpdate as any).ticket_tiers));
          updatedTiers[tierIndex].tickets_sold = (updatedTiers[tierIndex].tickets_sold || 0) + quantity;

          await strapi.entityService.update('api::event.event', numericEventId, {
            data: { ticket_tiers: updatedTiers },
          });
          console.log(`Update successful: tickets_sold for tier '${tierName}' on event ${numericEventId} is now ${updatedTiers[tierIndex].tickets_sold}`);
        } else {
          console.error(`CRITICAL: Could not find tier with name ${tierName} on event ${numericEventId}.`);
        }
        
        await strapi.service('api::order.order').create({
          data: {
            user_email: userEmail,
            event_id: String(numericEventId),
            razorpay_payment_id: razorpay_payment_id,
            ticket_tier: tierName, 
            quantity: quantity,
          },
        });
        
        const artisticWorkComponent = (eventToUpdate as any).artistic_work?.[0];
        const production = artisticWorkComponent?.production;
        const solo = artisticWorkComponent?.solo;
        
        const emailParams = {
          eventName: production?.title || solo?.title || 'Upcoming Performance',
          eventDate: new Date(eventToUpdate.date).toLocaleString(),
          eventVenue: eventToUpdate.venue,
          paymentId: razorpay_payment_id,
          tierName: tierName,
          quantity: quantity,
        };

        console.log(`Sending ticket email to ${userEmail}...`);
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: userEmail }];
        sendSmtpEmail.sender = { email: 'inbatamilanhk10@gmail.com', name: 'Dakshina Dance Company' };
        sendSmtpEmail.templateId = 1; // Replace with your actual Template ID
        sendSmtpEmail.params = emailParams;
        await brevoApi.sendTransacEmail(sendSmtpEmail);
        console.log("Ticket email sent successfully.");

      } else {
        console.error(`CRITICAL: Could not find event with event_code ${eventCode} after payment.`);
      }

    } catch (err) {
      console.error("Error processing order after verification:", err);
      return ctx.internalServerError('An error occurred while processing your order.');
    }
    
    return { status: 'ok' };
  },
};
