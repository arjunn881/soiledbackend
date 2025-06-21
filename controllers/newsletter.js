import nodemailer from "nodemailer";
import Newsletter from "../models/Newsletter.js";


export const newsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'You are already subscribed.' });
    }

    await Newsletter.create({ email });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NEWSLETTER_EMAIL,    // your Gmail
        pass: process.env.NEWSLETTER_EMAIL_PASS // app password
      }
    });

    // Email to you (Soiled)
    const adminMailOptions = {
      from: process.env.NEWSLETTER_EMAIL,
      to: 'me.soiled@gmail.com',
      subject: 'New Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; background: #111; color: #ccc; padding: 20px; border: 1px solid #333; border-radius: 8px;">
          <h2 style="color: #bb86fc;">📩 New Subscriber</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p style="font-size: 0.9rem; color: #888;">This is an automated notification from your site.</p>
        </div>
      `
    };

    // Auto-reply to subscriber
    const userMailOptions = {
      from: process.env.NEWSLETTER_EMAIL,
      to: email,
      subject: 'Thanks for subscribing!',
      html: `
        <div style="font-family: Arial, sans-serif; background: #111; color: #ccc; padding: 20px; border: 1px solid #333; border-radius: 8px;">
          <h2 style="color: #bb86fc;">Welcome to Soiled's Newsletter</h2>
          <p>Thank you for subscribing! You'll now get exclusive updates, new releases, and show announcements directly in your inbox.</p>
          <p>🎶 Stay connected.<br>Cheers,<br><strong style="color: #bb86fc;">Soiled</strong></p>
        </div>
      `
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.json({ message: 'Thanks for subscribing! Confirmation email sent.' });

  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}