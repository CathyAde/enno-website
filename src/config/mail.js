const nodemailer = require('nodemailer'); // ← cette ligne manquait

const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS
    }
});

module.exports = transporter;
