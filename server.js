const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Multer setup for optional file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CORS setup
const corsOptions = {
  origin: 'http://localhost:8080', // your frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));
app.options('/send-email', cors(corsOptions)); // handle preflight

// Body parser
app.use(express.json({ limit: '10mb' }));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use true for 465 if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Send email endpoint
app.post('/send-email', upload.single('idCopy'), async (req, res) => {
  try {
    // Handle both JSON and FormData
    const formData = req.body.formData ? JSON.parse(req.body.formData) : req.body.formData;
    const paymentInfo = req.body.paymentInfo ? JSON.parse(req.body.paymentInfo) : req.body.paymentInfo;

    // Set email subject/title
    let subject = '📋 New Form Submission';
    let title = 'New Form Submission';
    switch (paymentInfo?.type) {
      case 'contact_form':
        subject = '📩 New Contact Message'; title = 'New Contact Message'; break;
      case 'exam_registration':
        subject = '📝 New Exam Registration'; title = 'Exam Registration'; break;
      case 'study_abroad':
        subject = '🌍 Study Abroad Application'; title = 'Study Abroad Application'; break;
      case 'job_application':
        subject = '💼 Job Application'; title = 'Job Application'; break;
      case 'canada_visa_form':
        subject = '🇨🇦 Canada Visa Application'; title = 'Canada Visa Application'; break;
    }

    // Build email content
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
      <p><strong>Type:</strong> ${paymentInfo?.type}</p>
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

module.exports = app;
