const express = require('express');
const router = express.Router();
const { Content, Service, ContactMessage } = require('../models/index');

// Page d'accueil
router.get('/', async (req, res) => {
  try {
    const [services, content, hero] = await Promise.all([
      Service.findAll(),
      Content.findAll(),
      Content.findOne({ where: { page: 'accueil' } })
    ]);

    // Récupérer les highlights depuis la base ou utiliser des valeurs par défaut
    const highlights = await Content.findAll({ 
      where: { page: 'highlights' },
      limit: 3 
    });

    res.render('index', {
      title: 'ENNO - Solutions Énergétiques',
      services,
      content,
      hero: hero || { text: 'Solutions clés en main depuis 2008' },
      highlights: highlights.length > 0 ? highlights : [
        { title: 'Expertise technique locale', text: 'Nos ingénieurs maîtrisent les spécificités du terrain africain.' },
        { title: 'Solutions complètes clés en main', text: 'De l\'étude à la maintenance, nous gérons l\'intégralité de votre projet.' },
        { title: 'Support réactif 24/7', text: 'Une équipe dédiée pour vos urgences et un suivi personnalisé.' }
      ]
    });
  } catch (error) {
    console.error('Erreur page d\'accueil:', error);
    res.render('index', {
      title: 'ENNO - Solutions Énergétiques',
      services: [],
      hero: { text: 'Solutions clés en main depuis 2008' },
      highlights: [
        { title: 'Expertise technique locale', text: 'Nos ingénieurs maîtrisent les spécificités du terrain africain.' },
        { title: 'Solutions complètes clés en main', text: 'De l\'étude à la maintenance, nous gérons l\'intégralité de votre projet.' },
        { title: 'Support réactif 24/7', text: 'Une équipe dédiée pour vos urgences et un suivi personnalisé.' }
      ]
    });
  }
});

// Page services
router.get('/services', async (req, res) => {
  try {
    const [services, content] = await Promise.all([
      Service.findAll(),
      Content.findOne({ where: { page: 'services' } })
    ]);

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
      if (Content) {
        content = await Content.findOne({ where: { page: 'apropos' } });
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour le contenu about');
    }
    
    res.render('about', {
      title: 'À propos - ENNO',
      content: content || {
        title: 'Energies Nouvelles (ENNO)',
        text: `
          <div class="advantage-card">
            <div class="advantage-icon"><i class="fas fa-history"></i></div>
            <div class="advantage-content">
              <h3>Notre histoire</h3>
              <p>ENNO a été fondée en 2008 avec une mission claire : démocratiser l'accès à des solutions énergétiques fiables et durables en République du Congo.</p>
            </div>
          </div>
        `
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
    
    // Validation simple
    if (!name || !email || !message) {
      return res.redirect('/contact?error=Tous les champs obligatoires doivent être remplis');
    }
    
    // Créer le message dans la base de données
    await ContactMessage.create({
      name,
      email,
      phone: phone || null,
      subject: subject || 'Demande de contact',
      message,
      status: 'unread'
    });
    
    // Rediriger avec un message de succès
    res.redirect('/contact?success=Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.redirect('/contact?error=Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
  }
});

// API pour récupérer les projets
router.get('/api/projets', async (req, res) => {
  try {
    const { Projet } = require('../models/index');
    let projets = [];
    
    console.log('API projets appelée, modèle Projet:', !!Projet);
    
    if (Projet) {
      projets = await Projet.findAll({
        order: [['date', 'DESC']],
        limit: 6
      });
      console.log(`Projets trouvés: ${projets.length}`);
    }
    
    res.json(projets);
  } catch (error) {
    console.error('Erreur API projets:', error);
    res.json([]);
  }
});

// Routes supplémentaires
router.get('/projects', (req, res) => {
  res.render('projects', {
    title: 'Nos projets - ENNO',
    projects: []
  });
});

router.get('/blog', (req, res) => {
  res.render('blog', {
    title: 'Blog - ENNO',
    posts: []
  });
});

router.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ - ENNO',
    faqs: []
  });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Politique de confidentialité - ENNO'
  });
});

// Page 404
router.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page non trouvée - ENNO'
  });
});

module.exports = router;