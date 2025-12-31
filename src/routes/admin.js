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
router.get('/contents/accueil', contentController.editPageContent);

router.get('/contents/services', contentController.editPageContent);

router.get('/contents/apropos', contentController.editPageContent);

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
router.get('/stats', (req, res) => {
  res.render('admin/stats', {
    title: 'Statistiques détaillées',
    admin: req.session.user,
    layout: false
  });
});

// -----------------
// Logout
// -----------------
router.get('/logout', adminController.logout);

module.exports = router;
