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
    
    if (!name || !email || !message) {
      return res.redirect('/contact?error=Tous les champs obligatoires doivent être remplis');
    }
    
    try {
      const { ContactMessage } = require('../models/index');
      if (ContactMessage) {
        await ContactMessage.create({
          name,
          email,
          phone: phone || null,
          subject: subject || 'Demande de contact',
          message,
          status: 'unread'
        });
      }
    } catch (dbError) {
      console.log('Erreur sauvegarde message:', dbError);
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

module.exports = router;