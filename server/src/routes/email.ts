// /server/src/routes/email.ts
import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// Configure transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your 16-char app password
  },
});

// Verify SMTP connection (optional)
transporter.verify()
  .then(() => console.log('✅ Gmail SMTP ready'))
  .catch(err => console.error('❌ Gmail SMTP error:', err));

router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are all required.' });
  }

  const mailOptions = {
    from:    process.env.EMAIL_USER,   // must match authenticated Gmail
    replyTo: email,                    // replies go to the form-submitter
    to:      process.env.EMAIL_TO,     // where you want to receive these emails
    subject: `New contact form message from ${name}`,
    text:    `You got a new message:\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
    html:    `
      <h3>New contact form submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res
      .status(500)
      .json({ error: 'Failed to send email. Please try again later.' });
  }
});

export default router;
