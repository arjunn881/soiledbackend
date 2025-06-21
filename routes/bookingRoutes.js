import express from "express";
import Booking from "../models/Booking.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, contact, date, location, message } = req.body;

    if (!name || !email || !contact || !date || !location) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled."
      });
    }

    const newBooking = new Booking({ name, email, contact, date, location, message });
    await newBooking.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.BOOKING_EMAIL,
        pass: process.env.BOOKING_EMAIL_PASS
      }
    });

    // Email to you
    const adminMailOptions = {
      from: process.env.BOOKING_EMAIL,
      to: "me.soiled@gmail.com",
      subject: "New Booking Request",
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br>${message ? message.replace(/\n/g, '<br>') : 'N/A'}</p>
      `
    };

    // Auto-reply to user
    const userMailOptions = {
      from: process.env.BOOKING_EMAIL,
      to: email,
      subject: "Your Booking Request Received",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your booking request. I’ve received your details and will get back to you soon.</p>
        <p><em>Your booking request:</em></p>
        <ul>
        <li><strong>Contact:</strong> ${contact}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Message:</strong> ${message || 'N/A'}</li>
        </ul>
        <p>Cheers,<br>Soiled</p>
      `
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(201).json({
      success: true,
      message: "Booking request sent. Confirmation email delivered!"
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
