const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const secure = (process.env.SMTP_SECURE === 'true') || port === 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || user || 'no-reply@localhost';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined
});

// Vérifier la connexion au serveur SMTP au démarrage (non bloquant)
transporter.verify()
  .then(() => console.log('✅ SMTP ready'))
  .catch(err => console.warn('⚠️ SMTP verify failed:', err.message));

async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (err) {
    console.error('Erreur sendMail:', err);
    throw err;
  }
}

module.exports = { sendMail, transporter };
