// File: backend/src/api/inquiry/controllers/inquiry.ts

'use strict';

const Brevo = require('@getbrevo/brevo');

// Initialize the Brevo client
const brevoApi = new Brevo.TransactionalEmailsApi();
brevoApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export default {
  // This is our custom function to handle the inquiry form submission
  async send(ctx) {
    console.log("--- Inquiry 'send' endpoint reached ---");

    const { name, email, phone, countryCode, message } = ctx.request.body;

    if (!name || !email || !phone || !message) {
      return ctx.badRequest('Missing required form fields.');
    }

    const fullPhoneNumber = `${countryCode}${phone}`;
    
    // IMPORTANT: Replace this with the email address where you want to receive inquiries.
    const toEmail = 'inbatamilanhk10@gmail.com'; 
    const toName = 'The Dakshina Dance Repertory';

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      
      sendSmtpEmail.to = [{ email: toEmail, name: toName }];
      sendSmtpEmail.sender = { email: 'info@divyanayardance.com', name: 'Website Inquiry Form' }; // Use a verified sender
      sendSmtpEmail.replyTo = { email: email, name: name }; // This sets the reply-to to the user's email
      
      sendSmtpEmail.subject = `New Class Inquiry from ${name}`;
      sendSmtpEmail.htmlContent = `
        <h1>New Inquiry about Classes</h1>
        <p>You have received a new message from the website's inquiry form.</p>
        <hr>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${fullPhoneNumber}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;

      await brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log("Inquiry email sent successfully.");

      return { status: 'ok', message: 'Inquiry sent successfully!' };

    } catch (error) {
      console.error("Error sending inquiry email:", error);
      return ctx.internalServerError('An error occurred while sending the inquiry.');
    }
  },
};
