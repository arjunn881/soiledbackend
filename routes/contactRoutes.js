import express from 'express';
import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Please fill all required fields.' });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASS
      }
    });

    // Email to Soiled
    const adminMailOptions = {
      from: process.env.CONTACT_EMAIL,
      to: 'me.soiled@gmail.com',
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Auto-reply to user
    const userMailOptions = {
      from: process.env.CONTACT_EMAIL,
      to: email,
      subject: 'Thanks for reaching out!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for contacting me. I’ve received your message and will get back to you as soon as possible.</p>
        <p><em>Your message:</em><br>${message.replace(/\n/g, '<br>')}</p>
        <p>Cheers,<br>Soiled</p>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(201).json({ success: true, message: 'Message sent. Confirmation email delivered!' });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
