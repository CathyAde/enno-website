const express = require('express');
const router = express.Router();

// Page d'accueil
router.get('/', async (req, res) => {
  try {
    let services = [];
    let content = null;
    
    try {
      const { Service, Content } = require('../models/index');
      if (Service) {
        services = await Service.findAll();
      }
      if (Content) {
        content = await Content.findOne({ where: { page: 'accueil' } });
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour l\'accueil');
    }

    res.render('index', {
      title: 'ENNO - Solutions Énergétiques',
      services: services || [],
      content: content || { 
        title: 'ENNO - Solutions Énergétiques',
        text: 'Solutions clés en main depuis 2008' 
      }
    });
  } catch (error) {
    console.error('Erreur page d\'accueil:', error);
    res.render('index', {
      title: 'ENNO - Solutions Énergétiques',
      services: [],
      content: { 
        title: 'ENNO - Solutions Énergétiques',
        text: 'Solutions clés en main depuis 2008' 
      }
    });
  }
});

// Page services
router.get('/services', async (req, res) => {
  try {
    let services = [];
    let content = null;
    
    try {
      const { Service, Content } = require('../models/index');
      if (Service) {
        services = await Service.findAll();
      }
      if (Content) {
        content = await Content.findOne({ where: { page: 'services' } });
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour services');
    }

    res.render('service', {
      title: 'Nos services - ENNO',
      services,
      content: content || { 
        title: 'Nos expertises',
        text: 'Solutions clés en main : étude, installation, solaire, maintenance et support.'
      }
    });
  } catch (error) {
    console.error('Erreur page services:', error);
    res.render('service', {
      title: 'Nos services - ENNO',
      services: [],
      content: { 
        title: 'Nos expertises',
        text: 'Solutions clés en main : étude, installation, solaire, maintenance et support.'
      }
    });
  }
});

// Page à propos
router.get('/about', async (req, res) => {
  try {
    let content = null;
    
    try {
      const { Content } = require('../models/index');
      if (Content) {
        content = await Content.findOne({ where: { page: 'apropos' } });
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour about');
    }
    
    res.render('about', {
      title: 'À propos - ENNO',
      content: content || {
        title: 'Energies Nouvelles (ENNO)',
        text: 'Fondée en 2008, ENNO est spécialisée dans les solutions énergétiques durables en République du Congo.'
      }
    });
  } catch (error) {
    console.error('Erreur page about:', error);
    res.render('about', {
      title: 'À propos - ENNO',
      content: {
        title: 'Energies Nouvelles (ENNO)',
        text: 'Nous accompagnons entreprises et particuliers dans la transition énergétique.'
      }
    });
  }
});

// Page contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact - ENNO',
    success: req.query.success,
    error: req.query.error
  });
});

// Traitement du formulaire de contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    console.log('📧 Nouveau message reçu:', { name, email, subject });
    
    if (!name || !email || !message) {
      return res.redirect('/contact?error=Tous les champs obligatoires doivent être remplis');
    }
    
    try {
      const { ContactMessage } = require('../models/index');
      if (ContactMessage) {
        const newMessage = await ContactMessage.create({
          name,
          email,
          phone: phone || null,
          subject: subject || 'Demande de contact',
          message,
          status: 'unread'
        });
        console.log('📧 Nouveau message reçu:', { name, email, subject });
      } else {
        console.log('❌ ContactMessage model non disponible');
      }
    } catch (dbError) {
      console.log('❌ Erreur sauvegarde message:', dbError.message);
    }
    
    res.redirect('/contact?success=Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.redirect('/contact?error=Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
  }
});

// API pour récupérer les projets
router.get('/api/projets', async (req, res) => {
  try {
    let projets = [];
    
    try {
      const { Projet } = require('../models/index');
      if (Projet) {
        projets = await Projet.findAll({
          order: [['date', 'DESC']],
          limit: 6
        });
      }
    } catch (dbError) {
      console.log('Erreur récupération projets:', dbError);
    }
    
    res.json(projets);
  } catch (error) {
    console.error('Erreur API projets:', error);
    res.json([]);
  }
});

// Route de test pour vérifier la base de données
router.get('/test-db', async (req, res) => {
  try {
    const { ContactMessage, Admin, Content, Service, Projet } = require('../models/index');
    
    const results = {
      database: process.env.DATABASE_URL ? 'Configurée' : 'Non configurée',
      models: {
        ContactMessage: !!ContactMessage,
        Admin: !!Admin,
        Content: !!Content,
        Service: !!Service,
        Projet: !!Projet
      },
      counts: {}
    };
    
    // Tester chaque modèle
    try {
      if (ContactMessage) {
        results.counts.messages = await ContactMessage.count();
        const recent = await ContactMessage.findAll({ 
          order: [['createdAt', 'DESC']], 
          limit: 3 
        });
        results.recentMessages = recent.map(m => ({
          name: m.name,
          subject: m.subject,
          date: m.createdAt
        }));
      }
    } catch (e) {
      results.errors = results.errors || {};
      results.errors.ContactMessage = e.message;
    }
    
    try {
      if (Admin) results.counts.admins = await Admin.count();
    } catch (e) {
      results.errors = results.errors || {};
      results.errors.Admin = e.message;
    }
    
    try {
      if (Content) results.counts.contents = await Content.count();
    } catch (e) {
      results.errors = results.errors || {};
      results.errors.Content = e.message;
    }
    
    res.json(results);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Route simple pour tester
router.get('/init', async (req, res) => {
  try {
    console.log('🔄 Initialisation demandée via /init');
    
    const { sequelize, Admin, ContactMessage } = require('../models/index');
    
    // Synchroniser
    await sequelize.sync({ force: false });
    
    // Compter les messages
    const messageCount = await ContactMessage.count();
    
    res.send(`
      <h1>Initialisation ENNO</h1>
      <p>Base synchronisée ✅</p>
      <p>Messages en base: ${messageCount}</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <a href="/admin/login">Aller à l'admin</a>
    `);
  } catch (error) {
    res.send(`
      <h1>Erreur Initialisation</h1>
      <p>Erreur: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

module.exports = router;