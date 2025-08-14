// File: backend/src/api/orders/controllers/orders.ts

'use strict';

import * as crypto from 'crypto';
const Razorpay = require('razorpay');
const Brevo = require('@getbrevo/brevo');
import Mux from '@mux/mux-node';

// Initialize clients
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const brevoApi = new Brevo.TransactionalEmailsApi();
brevoApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// Helper function to generate a JWT-signed URL
const generateSecureMuxUrl = async (assetId: string, expirationDuration: string) => {
  if (!assetId) return null;
  try {
    const playbackId = await mux.video.assets.createPlaybackId(assetId, { policy: 'signed' });
    
    const token = await mux.jwt.signPlaybackId(playbackId.id, {
      keyId: process.env.MUX_SIGNING_KEY_ID,
      keySecret: process.env.MUX_BASE64_PRIVATE_KEY,
      expiration: expirationDuration,
      type: 'video'
    });
    
    console.log(`Secure Mux Playback ID and JWT generated for ${playbackId.id}`);
    return { playbackId: playbackId.id, token: token };

  } catch (error) {
    console.error(`Error generating Mux URL for asset ${assetId}:`, error);
    return null;
  }
};

module.exports = {
  async create(ctx) {
    console.log("--- Universal create order endpoint reached ---");
    try {
      const { amount, tierName, quantity, eventId, eventUid, workshopId, workshopSlug, userName, userQuestion } = ctx.request.body;
      
      let options;

      if (eventId && eventUid) {
        options = { 
            amount, 
            currency: "INR", 
            receipt: `receipt_evt_${eventId}_${Date.now()}`, 
            notes: { 
                type: 'event', 
                eventCode: eventUid, 
                tierName, 
                quantity: String(quantity) 
            } 
        };
      } else if (workshopId && workshopSlug) {
        options = { 
            amount, 
            currency: "INR", 
            receipt: `receipt_ws_${workshopId}_${Date.now()}`, 
            notes: { 
                type: 'workshop', 
                eventCode: workshopSlug, 
                tierName, 
                quantity: String(quantity),
                userName: userName,
                userQuestion: userQuestion,
            } 
        };
      } else {
        return ctx.badRequest("Invalid request body.");
      }

      const order = await razorpay.orders.create(options);
      return order;

    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return ctx.internalServerError("Could not create order.");
    }
  },

  async verify(ctx) {
    console.log("--- Universal verification endpoint reached ---");

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = ctx.request.body;
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
      const { type, eventCode, tierName, quantity: qtyString, userName, userQuestion } = orderDetails.notes;
      const quantity = parseInt(qtyString, 10);

      if (!type || !eventCode || !userEmail || !tierName || !quantity) {
        throw new Error("Could not find all required details in order notes.");
      }
      
      let itemToUpdate;
      let numericId;
      let emailParams = {};
      let secureWatchLinks = [];
      let brevoTemplateId = 1;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      if (type === 'event') {
        const events = await strapi.entityService.findMany('api::event.event', { 
          filters: { uid: eventCode }, 
          populate: { artistic_work: { populate: '*' } } 
        } as any);
        itemToUpdate = events?.[0];
        if (itemToUpdate) {
          numericId = itemToUpdate.id;
          const artisticWork = (itemToUpdate as any).artistic_work?.[0];
          emailParams = { 
            eventName: artisticWork?.production?.title || artisticWork?.solo?.title, 
            eventDate: new Date(itemToUpdate.date).toLocaleString(), 
            eventVenue: itemToUpdate.venue 
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
            eventVenue: itemToUpdate.venue, 
            schedule: (itemToUpdate as any).schedule 
          };
        }
      }

      if (itemToUpdate) {
        const tierIndex = (itemToUpdate as any).ticket_tiers.findIndex(t => t.name === tierName);
        if (tierIndex > -1) {
          const purchasedTier = (itemToUpdate as any).ticket_tiers[tierIndex];
          
          if (purchasedTier.is_zoom_access){
            brevoTemplateId = 6;
            secureWatchLinks = (itemToUpdate as any).schedule.filter(s => s.zoom_link).map(s => ({ name: s.topic || `Session on ${new Date(s.date).toLocaleDateString()}`, url: s.zoom_link }));
          } else if (purchasedTier.is_online_access) {
            brevoTemplateId = (type === 'event') ? 4 : 5;
            if (type === 'event') {
              const eventEndTime = new Date(itemToUpdate.date).getTime();
              const expirationTime = eventEndTime + (6 * 60 * 60 * 1000);
              const durationInSeconds = Math.floor((expirationTime - Date.now()) / 1000);
              const muxData = await generateSecureMuxUrl((itemToUpdate as any).mux_livestream_id, `${durationInSeconds}s`);
              if (muxData) secureWatchLinks.push({ name: 'Watch Live', url: `${frontendUrl}/watch/${muxData.playbackId}?token=${muxData.token}` });
            } else if (type === 'workshop') {
              for (const session of (itemToUpdate as any).schedule) {
                const sessionEndTime = new Date(`${session.date}T${session.end_time}`).getTime();
                const expirationTime = sessionEndTime + (6 * 60 * 60 * 1000);
                const durationInSeconds = Math.floor((expirationTime - Date.now()) / 1000);
                const muxData = await generateSecureMuxUrl(session.mux_livestream_id, `${durationInSeconds}s`);
                if (muxData) secureWatchLinks.push({ name: session.topic || `Session on ${new Date(session.date).toLocaleDateString()}`, url: `${frontendUrl}/watch/${muxData.playbackId}?token=${muxData.token}` });
              }
            }
          } else {
            brevoTemplateId = (type === 'event') ? 1 : 3;
          }

          const updatedTiers = JSON.parse(JSON.stringify((itemToUpdate as any).ticket_tiers));
          updatedTiers[tierIndex].tickets_sold = (updatedTiers[tierIndex].tickets_sold || 0) + quantity;
          
          if (type === 'event') {
            await strapi.entityService.update('api::event.event', numericId, { data: { ticket_tiers: updatedTiers } });
          } else if (type === 'workshop') {
            await strapi.entityService.update('api::workshop.workshop', numericId, { data: { ticket_tiers: updatedTiers } });
          }
        }
        
        await strapi.service('api::order.order').create({
          data: {
            user_email: userEmail,
            related_item_id: String(numericId),
            razorpay_payment_id: razorpay_payment_id,
            ticket_tier: tierName, 
            quantity: quantity,
            secure_watch_links: secureWatchLinks,
          },
        });
        
        Object.assign(emailParams, {
          paymentId: razorpay_payment_id,
          tierName: tierName,
          quantity: quantity,
          watchLinks: secureWatchLinks,
          userName: userName,
          userQuestion: userQuestion
        });

        const customerEmail = new Brevo.SendSmtpEmail();
        customerEmail.to = [{ email: userEmail }];
        customerEmail.sender = { email: 'info@divyanayardance.com', name: 'The Dakshina Dance Repertory' };
        customerEmail.templateId = brevoTemplateId;
        customerEmail.params = emailParams;
        await brevoApi.sendTransacEmail(customerEmail);
        console.log(`Confirmation email sent to ${userEmail}.`);

        if ((type === 'workshop' || type === 'event') && userQuestion) {
            const inquiryEmail = new Brevo.SendSmtpEmail();
            const companyEmail = 'inbatamilanhk10@gmail.com'; // IMPORTANT: Replace this
            inquiryEmail.to = [{ email: companyEmail }];
            inquiryEmail.sender = { email: 'nereply@divyanayardance.com', name: 'Workshop Registration' };
            inquiryEmail.replyTo = { email: userEmail, name: userName };
            inquiryEmail.subject = `New Question from Registrant: ${userName}`;
            inquiryEmail.htmlContent = `
                <p>A new participant has registered for "${itemToUpdate.title}" and submitted a question.</p>
                <hr>
                <p><strong>Participant Name:</strong> ${userName}</p>
                <p><strong>Participant Email:</strong> ${userEmail}</p>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                <p><strong>Question:</strong></p>
                <p>${userQuestion}</p>
            `;
            await brevoApi.sendTransacEmail(inquiryEmail);
            console.log(`Inquiry email sent to ${companyEmail}.`);
        }

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
