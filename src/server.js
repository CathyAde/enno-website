const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour Render
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Importer les middlewares
const flash = require('./middlewares/flash');

// Middleware pour parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions simples
app.use(session({
  secret: process.env.SESSION_SECRET || 'enno-admin-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Middleware flash pour les messages
app.use(flash);

// Session dispo dans les vues
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session?.user;
  next();
});

// Fichiers statiques - DOIT être avant les routes
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static(path.join(__dirname, '../public')));

// Vues EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Désactiver les layouts pour les pages admin AVANT d'activer expressLayouts
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = false;
  }
  next();
});

app.use(expressLayouts);
app.set('layout', 'layout');

// Route de debug pour Railway
app.get('/debug-messages', async (req, res) => {
  try {
    const { ContactMessage, sequelize } = require('./models/index');
    
    // Forcer la synchronisation
    await sequelize.sync({ force: false });
    
    // Créer un message de test
    const testMessage = await ContactMessage.create({
      name: 'Test Railway',
      email: 'test@railway.com',
      phone: '+242000000000',
      subject: 'Test message Railway',
      message: 'Message de test pour vérifier Railway',
      status: 'unread'
    });
    
    // Compter tous les messages
    const totalMessages = await ContactMessage.count();
    const allMessages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.send(`
      <h1>🚆 Railway Debug</h1>
      <p><strong>Total messages:</strong> ${totalMessages}</p>
      <p><strong>Message test créé:</strong> ID ${testMessage.id}</p>
      <h3>Tous les messages:</h3>
      <ul>
        ${allMessages.map(m => `
          <li>
            <strong>${m.name}</strong> (${m.email})<br>
            <em>${m.subject}</em><br>
            ${m.message}<br>
            <small>Status: ${m.status} | Date: ${m.createdAt}</small>
          </li>
        `).join('')}
      </ul>
      <p><a href="/admin/login">Aller à l'admin</a></p>
    `);
  } catch (error) {
    res.send(`
      <h1>❌ Erreur Railway</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

// Routes admin de secours supprimées - utilisation du fichier routes/admin.js

// Routes principales
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Charger les routes admin complètes
try {
  const adminRoutes = require('./routes/admin');
  app.use('/admin', adminRoutes);
  console.log('✅ Routes admin complètes chargées');
} catch (error) {
  console.log('⚠️ Erreur routes admin:', error.message);
  
  // Routes de secours pour Railway
  app.get('/admin/messages', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { ContactMessage } = require('./models/index');
      const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
      
      res.render('admin/messages', {
        title: 'Messages',
        messages,
        admin: req.session.user,
        layout: false
      });
    } catch (err) {
      res.send(`<h1>Messages</h1><p>Erreur: ${err.message}</p><a href="/admin">Retour</a>`);
    }
  });
  
  app.get('/admin/contents/accueil', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { Content } = require('./models/index');
      const content = await Content.findOne({ where: { page: 'accueil' } });
      
      res.render('admin/editContent', {
        title: 'Modifier Accueil',
        content: content || { page: 'accueil', title: '', subtitle: '', text: '' },
        admin: req.session.user,
        layout: false
      });
    } catch (err) {
      res.send(`<h1>Gestion Accueil</h1><p>Erreur: ${err.message}</p><a href="/admin">Retour</a>`);
    }
  });
  
  app.get('/admin/contents/services', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { Content } = require('./models/index');
      const content = await Content.findOne({ where: { page: 'services' } });
      
      res.render('admin/editContent', {
        title: 'Modifier Services',
        content: content || { page: 'services', title: '', subtitle: '', text: '' },
        admin: req.session.user,
        layout: false
      });
    } catch (err) {
      res.send(`<h1>Gestion Services</h1><p>Erreur: ${err.message}</p><a href="/admin">Retour</a>`);
    }
  });
  
  app.get('/admin/contents/apropos', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { Content } = require('./models/index');
      const content = await Content.findOne({ where: { page: 'apropos' } });
      
      res.render('admin/editContent', {
        title: 'Modifier À propos',
        content: content || { page: 'apropos', title: '', subtitle: '', text: '' },
        admin: req.session.user,
        layout: false
      });
    } catch (err) {
      res.send(`<h1>Gestion À propos</h1><p>Erreur: ${err.message}</p><a href="/admin">Retour</a>`);
    }
  });
  
  app.post('/admin/contents/:page', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { Content } = require('./models/index');
      const { title, subtitle, text } = req.body;
      const page = req.params.page;
      
      await Content.upsert({ page, title, subtitle, text });
      res.redirect(`/admin/contents/${page}?success=1`);
    } catch (err) {
      res.redirect(`/admin/contents/${req.params.page}?error=${err.message}`);
    }
  });
}

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée - ENNO' });
});

// Erreurs serveur
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).render('error', {
    title: 'Erreur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue',
    errorDetails: process.env.NODE_ENV === 'development' ? err.stack : null
  });
});

// Démarrage serveur avec initialisation DB
app.listen(PORT, async () => {
  console.log(`🚀 ENNO lancé sur http://localhost:${PORT}`);
  console.log(`📱 Admin: http://localhost:${PORT}/admin/login`);
  
  // Initialiser la base de données
  try {
    const { sequelize, Admin, Content } = require('./models/index');
    const bcrypt = require('bcrypt');
    
    console.log('🔄 Synchronisation de la base de données...');
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    
    // Créer admin par défaut
    const adminExists = await Admin.findOne({ where: { email: 'admin@enno.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'Admin ENNO',
        email: 'admin@enno.com',
        password: hashedPassword
      });
      console.log('✅ Admin créé: admin@enno.com / admin123');
    }
    
    // Créer contenu par défaut
    await Content.upsert({
      page: 'accueil',
      title: 'ENNO - Solutions Énergétiques',
      subtitle: 'Votre partenaire en énergie depuis 2008',
      text: 'ENNO accompagne les entreprises et particuliers dans leurs projets énergétiques avec expertise et professionnalisme.'
    });
    
    await Content.upsert({
      page: 'services',
      title: 'Nos Services',
      subtitle: 'Des solutions complètes pour tous vos besoins',
      text: 'Installation solaire, maintenance, études techniques et accompagnement personnalisé.'
    });
    
    await Content.upsert({
      page: 'apropos',
      title: 'À propos d\'ENNO',
      subtitle: 'Une entreprise engagée pour l\'avenir énergétique',
      text: 'Fondée en 2008, ENNO est spécialisée dans les solutions énergétiques durables en République du Congo.'
    });
    
    console.log('✅ Contenu par défaut créé');
    console.log('🎉 Initialisation terminée');
  } catch (error) {
    console.error('❌ Erreur initialisation:', error.message);
  }
});