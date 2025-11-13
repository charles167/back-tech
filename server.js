const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 👇 Root route
app.get("/", (req, res) => {
  res.send("Backend API is running successfully 🚀");
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use true for port 465 if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending endpoint
app.post('/send-email', upload.single('idCopy'), async (req, res) => {
  try {
    const { formData, paymentInfo } = req.body;

    let subject = '';
    let title = '';

    switch (paymentInfo?.type) {
      case 'contact_form':
        subject = '📩 New Contact Message';
        title = 'New Contact Message';
        break;
      case 'exam_registration':
        subject = '📝 New Exam Registration';
        title = 'New Exam Registration';
        break;
      case 'study_abroad':
        subject = '🌍 Study Abroad Application';
        title = 'Study Abroad Application';
        break;
      case 'job_application':
        subject = '💼 Job Application';
        title = 'Job Application';
        break;
      case 'canada_visa_form':
        subject = '🇨🇦 Canada Visa Application';
        title = 'Canada Visa Application';
        break;
      default:
        subject = '📋 New Form Submission';
        title = 'New Form Submission';
    }

    let emailContent = `
      <h2>${title}</h2>
      <h3>Form Data:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
    `;

    for (const [key, value] of Object.entries(formData || {})) {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      emailContent += `<p><strong>${formattedKey}:</strong> ${value || 'Not provided'}</p>`;
    }

    emailContent += `
      </div>
      <h3>Submission Details:</h3>
      <p><strong>Submission Type:</strong> ${paymentInfo?.type}</p>
      <p><strong>Reference:</strong> ${paymentInfo?.reference}</p>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'charlesablanya@gmail.com',
      subject,
      html: emailContent,
      attachments: req.file ? [{
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype
      }] : []
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// 👇 Vercel requires you to export the app, not listen
module.exports = app;
