const express = require('express');
const methodOverride = require('method-override');
const router = express.Router();

// Middleware pour supporter PUT/DELETE via formulaires
router.use(methodOverride('_method'));

const adminController = require('../controllers/adminController');
const serviceAdminController = require('../controllers/serviceAdminController');
const contentController = require('../controllers/contentController');
const imageController = require('../controllers/imageController');

const adminAuth = require('../middlewares/adminAuth');

// -----------------
// Routes publiques
// -----------------
router.get('/login', adminController.loginForm);
router.post('/login', adminController.login);

// -----------------
// Routes protégées
// -----------------
router.use(adminAuth);

// Dashboard
router.get('/', adminController.dashboard);

// -----------------
// Services
// -----------------
router.get('/services', serviceAdminController.listServices);
router.get('/services/new', serviceAdminController.createServiceForm);
router.post('/services', serviceAdminController.createService);
router.get('/services/:id/edit', serviceAdminController.editServiceForm);
router.post('/services/:id', serviceAdminController.updateService);
router.delete('/services/:id', serviceAdminController.deleteService);

// -----------------
// Messages
// -----------------
router.get('/messages', adminController.listMessages);
router.get('/messages/:id', adminController.viewMessage);
router.post('/messages/:id/status', adminController.updateMessageStatus);
router.delete('/messages/:id', adminController.deleteMessage);

// -----------------
// Gestion des contenus par page
// -----------------
router.get('/contents/accueil', (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  contentController.editPageContent(req, res);
});

router.get('/contents/services', (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  contentController.editPageContent(req, res);
});

router.get('/contents/apropos', (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  contentController.editPageContent(req, res);
});

router.post('/contents/:page', contentController.uploadImage, contentController.updatePageContent);

// -----------------
// Contenu générique
// -----------------
router.get('/contents', contentController.listContents);
router.get('/contents/new', contentController.newContentForm);
router.post('/contents', contentController.createContent);
router.get('/contents/:id/edit', contentController.editContentForm);
router.post('/contents/:id', contentController.updateContent);
router.delete('/contents/:id', contentController.deleteContent);

// -----------------
// Projets réalisés
// -----------------
router.get('/projets', contentController.listProjets);
router.post('/projets', contentController.uploadImage, contentController.createProjet);
router.post('/projets/:id', contentController.uploadImage, contentController.updateProjet);
router.delete('/projets/:id', contentController.deleteProjet);

// -----------------
// Images
// -----------------
router.get('/images', (req, res) => {
  res.render('admin/images', {
    title: 'Gestion des images',
    admin: req.session.user,
    layout: false
  });
});
router.get('/api/images', imageController.listImages);
router.post('/images/upload', imageController.uploadImage, imageController.handleImageUpload);
router.delete('/images/:filename', imageController.deleteImage);

// -----------------
// Statistiques
// -----------------
router.get('/stats', adminController.getStats);

// Route pour générer des données de test
router.post('/generate-test-data', async (req, res) => {
  try {
    const { Visitor } = require('../models/index');
    
    // Générer 50 visiteurs de test sur les 7 derniers jours
    const testData = [];
    const pages = ['/', '/services', '/apropos', '/contact'];
    const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0'
    ];
    
    for (let i = 0; i < 50; i++) {
      const randomDays = Math.floor(Math.random() * 7);
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() - randomDays);
      
      testData.push({
        ip: ips[Math.floor(Math.random() * ips.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        referer: Math.random() > 0.5 ? 'https://google.com' : null,
        sessionId: `test-session-${i}`,
        createdAt: visitDate,
        updatedAt: visitDate
      });
    }
    
    await Visitor.bulkCreate(testData);
    
    req.flash('success', '50 visiteurs de test générés avec succès!');
    res.redirect('/admin/stats');
  } catch (error) {
    req.flash('error', 'Erreur lors de la génération des données: ' + error.message);
    res.redirect('/admin/stats');
  }
});

// Route pour voir les détails des visiteurs
router.get('/visitors', async (req, res) => {
  try {
    const { Visitor } = require('../models/index');
    const { Op } = require('sequelize');
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const visitors = await Visitor.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(visitors.count / limit);
    
    res.render('admin/visitors', {
      title: 'Détails des visiteurs',
      admin: req.session.user,
      visitors: visitors.rows,
      currentPage: page,
      totalPages,
      totalVisitors: visitors.count,
      layout: false
    });
  } catch (error) {
    console.error('Erreur visitors:', error);
    res.render('admin/visitors', {
      title: 'Détails des visiteurs',
      admin: req.session.user,
      visitors: [],
      currentPage: 1,
      totalPages: 0,
      totalVisitors: 0,
      error: 'Erreur lors du chargement des visiteurs',
      layout: false
    });
  }
});

// -----------------
// Logout
// -----------------
router.get('/logout', adminController.logout);

module.exports = router;
