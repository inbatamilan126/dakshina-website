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
  // --- This function is now universal ---
  async create(ctx) {
    console.log("--- Universal create order endpoint reached ---");
    try {
      const { amount, tierName, quantity, eventId, eventUid, workshopId, workshopSlug } = ctx.request.body;
      
      let options;

      // Check if this is for an Event (Production) or a Workshop
      if (eventId && eventUid) {
        options = {
          amount: amount,
          currency: "INR",
          receipt: `receipt_evt_${eventId}_${Date.now()}`,
          notes: { 
            type: 'event',
            eventCode: eventUid,
            tierName: tierName,
            quantity: String(quantity),
          }
        };
      } else if (workshopId && workshopSlug) {
        options = {
          amount: amount,
          currency: "INR",
          receipt: `receipt_ws_${workshopId}_${Date.now()}`,
          notes: { 
            type: 'workshop',
            eventCode: workshopSlug,
            tierName: tierName,
            quantity: String(quantity),
          }
        };
      } else {
        return ctx.badRequest("Invalid request body. Missing event or workshop identifier.");
      }

      const order = await razorpay.orders.create(options);
      if (!order) return ctx.badRequest("Order creation failed.");
      return order;

    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return ctx.internalServerError("Could not create order.");
    }
  },

  // --- This function is now universal ---
  async verify(ctx) {
    console.log("--- Universal verification endpoint reached ---");

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
      return ctx.badRequest('Invalid payment signature');
    }

    console.log("Signature is valid. Processing order...");

    try {
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

      const userEmail = paymentDetails.email;
      const { type, eventCode, tierName, quantity: qtyString } = orderDetails.notes;
      const quantity = parseInt(qtyString, 10);

      if (!type || !eventCode || !userEmail || !tierName || !quantity) {
        throw new Error("Could not find all required details in order notes.");
      }
      
      let itemToUpdate;
      let numericId;
      let emailParams = {};

      // Handle based on the type stored in the notes
      if (type === 'event') {
        const events = await strapi.entityService.findMany('api::event.event', { filters: { uid: eventCode } as any, populate: '*' });
        itemToUpdate = events?.[0];
        if (itemToUpdate) {
          numericId = itemToUpdate.id;
          const artisticWork = (itemToUpdate as any).artistic_work?.[0];
          emailParams = {
            eventName: artisticWork?.production?.title || artisticWork?.solo?.title,
            eventDate: new Date(itemToUpdate.date).toLocaleString(),
            eventVenue: itemToUpdate.venue,
          };
        }
      } else if (type === 'workshop') {
        const workshops = await strapi.entityService.findMany('api::workshop.workshop', { filters: { slug: eventCode } as any, populate: '*' });
        itemToUpdate = workshops?.[0];
        if (itemToUpdate) {
          numericId = itemToUpdate.id;
          emailParams = {
            eventName: itemToUpdate.title,
            eventDate: `${new Date(itemToUpdate.start_date).toLocaleDateString()} - ${new Date(itemToUpdate.end_date).toLocaleDateString()}`,
            eventVenue: "Workshop",
          };
        }
      }

      if (itemToUpdate) {
        const tierIndex = (itemToUpdate as any).ticket_tiers.findIndex(t => t.name === tierName);
        if (tierIndex > -1) {
          const updatedTiers = JSON.parse(JSON.stringify((itemToUpdate as any).ticket_tiers));
          updatedTiers[tierIndex].tickets_sold = (updatedTiers[tierIndex].tickets_sold || 0) + quantity;

          // --- CRUCIAL FIX: Use explicit update calls to satisfy TypeScript ---
          if (type === 'event') {
            await strapi.entityService.update('api::event.event', numericId, {
              data: { ticket_tiers: updatedTiers },
            });
          } else if (type === 'workshop') {
            await strapi.entityService.update('api::workshop.workshop', numericId, {
              data: { ticket_tiers: updatedTiers },
            });
          }
          console.log(`Update successful for ${type} ${numericId}`);
        }
        
        await strapi.service('api::order.order').create({
          data: {
            user_email: userEmail,
            event_id: String(numericId),
            razorpay_payment_id: razorpay_payment_id,
            ticket_tier: tierName, 
            quantity: quantity,
          },
        });
        
        Object.assign(emailParams, {
          paymentId: razorpay_payment_id,
          tierName: tierName,
          quantity: quantity,
        });

        console.log(`Sending ticket email to ${userEmail}...`);
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: userEmail }];
        sendSmtpEmail.sender = { email: 'info@divyanayardance.com', name: 'The Dakshina Dance Repertory' };
        sendSmtpEmail.templateId = 1; // You might want different template IDs for events vs workshops
        sendSmtpEmail.params = emailParams;
        await brevoApi.sendTransacEmail(sendSmtpEmail);
        console.log("Ticket email sent successfully.");

      } else {
        console.error(`CRITICAL: Could not find ${type} with code ${eventCode} after payment.`);
      }

    } catch (err) {
      console.error("Error processing order after verification:", err);
      return ctx.internalServerError('An error occurred while processing your order.');
    }
    
    return { status: 'ok' };
  },
};
