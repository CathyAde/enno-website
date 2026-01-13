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

// Middleware de tracking des visiteurs
app.use(async (req, res, next) => {
  // Ignorer les fichiers statiques et routes admin
  if (req.path.startsWith('/css') || req.path.startsWith('/js') || 
      req.path.startsWith('/images') || req.path.startsWith('/admin') ||
      req.path.startsWith('/debug')) {
    return next();
  }
  
  try {
    const { Visitor } = require('./models/index');
    if (Visitor) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const page = req.path;
      const referer = req.get('Referer') || null;
      const sessionId = req.sessionID || null;
      
      await Visitor.create({
        ip,
        userAgent,
        page,
        referer,
        sessionId
      });
      
      console.log(`👥 Visiteur: ${ip} sur ${page}`);
    }
  } catch (error) {
    // Ignorer les erreurs de tracking pour ne pas casser le site
    console.log('Erreur tracking visiteur:', error.message);
  }
  
  next();
});

// Route de diagnostic complète pour Railway
app.get('/debug-messages', async (req, res) => {
  let diagnosticInfo = [];
  
  try {
    diagnosticInfo.push('🔍 DIAGNOSTIC COMPLET RAILWAY');
    
    // 1. Vérifier les variables d'environnement
    diagnosticInfo.push('\n📋 VARIABLES D\'ENVIRONNEMENT:');
    diagnosticInfo.push(`DATABASE_URL: ${process.env.DATABASE_URL ? 'CONFIGURÉ' : 'MANQUANT'}`);
    diagnosticInfo.push(`NODE_ENV: ${process.env.NODE_ENV}`);
    diagnosticInfo.push(`PORT: ${process.env.PORT}`);
    
    // 2. Tester la connexion à la base
    diagnosticInfo.push('\n🔌 CONNEXION BASE DE DONNÉES:');
    const { ContactMessage, sequelize } = require('./models/index');
    
    await sequelize.authenticate();
    diagnosticInfo.push('✅ Connexion PostgreSQL réussie');
    
    // 3. Synchroniser les tables
    diagnosticInfo.push('\n🔄 SYNCHRONISATION TABLES:');
    await sequelize.sync({ force: false });
    diagnosticInfo.push('✅ Tables synchronisées');
    
    // 4. Vérifier les tables existantes
    const tables = await sequelize.getQueryInterface().showAllTables();
    diagnosticInfo.push(`📊 Tables trouvées: ${tables.join(', ')}`);
    
    // 5. Compter les messages existants
    diagnosticInfo.push('\n📧 MESSAGES EXISTANTS:');
    const existingCount = await ContactMessage.count();
    diagnosticInfo.push(`Messages existants: ${existingCount}`);
    
    // 6. Créer un message de test
    diagnosticInfo.push('\n🧪 CRÉATION MESSAGE TEST:');
    const testMessage = await ContactMessage.create({
      name: 'Test Railway Diagnostic',
      email: 'diagnostic@railway.com',
      phone: '+242000000000',
      subject: 'Message de diagnostic Railway',
      message: 'Ce message a été créé automatiquement pour tester la base de données.',
      status: 'unread'
    });
    diagnosticInfo.push(`✅ Message test créé avec ID: ${testMessage.id}`);
    
    // 7. Récupérer tous les messages
    const allMessages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const totalMessages = await ContactMessage.count();
    diagnosticInfo.push(`📊 Total messages après test: ${totalMessages}`);
    
    // 8. Afficher le résultat
    res.send(`
      <h1>🚆 DIAGNOSTIC RAILWAY COMPLET</h1>
      <pre>${diagnosticInfo.join('\n')}</pre>
      
      <h2>📧 DERNIERS MESSAGES (${allMessages.length}):</h2>
      <ul>
        ${allMessages.map(m => `
          <li style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
            <strong>${m.name}</strong> (${m.email})<br>
            <em>${m.subject}</em><br>
            ${m.message}<br>
            <small>Status: ${m.status} | Date: ${m.createdAt}</small>
          </li>
        `).join('')}
      </ul>
      
      <h2>🔗 LIENS UTILES:</h2>
      <p><a href="/admin/login">🔐 Admin Login</a></p>
      <p><a href="/admin/messages">📧 Voir Messages Admin</a></p>
      <p><a href="/">🏠 Retour Accueil</a></p>
      
      <h2>✅ RÉSOLUTION:</h2>
      <p>Si vous voyez ce message, la base de données fonctionne correctement !</p>
      <p>Les messages devraient maintenant apparaître dans l'admin.</p>
    `);
    
  } catch (error) {
    diagnosticInfo.push(`\n❌ ERREUR: ${error.message}`);
    diagnosticInfo.push(`Stack: ${error.stack}`);
    
    res.send(`
      <h1>❌ ERREUR DIAGNOSTIC RAILWAY</h1>
      <pre>${diagnosticInfo.join('\n')}</pre>
      
      <h2>🔧 SOLUTIONS POSSIBLES:</h2>
      <ul>
        <li>Vérifier que DATABASE_URL est configuré dans Railway</li>
        <li>Vérifier que le service PostgreSQL est démarré</li>
        <li>Vérifier que les deux services sont dans le même projet</li>
        <li>Redémarrer le service web Railway</li>
      </ul>
      
      <p><a href="/admin/login">Essayer l'admin quand même</a></p>
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
      console.log('Tentative de récupération des messages...');
      
      const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
      console.log(`Messages trouvés: ${messages.length}`);
      
      res.render('admin/messages', {
        title: 'Messages',
        messages,
        admin: req.session.user,
        layout: false
      });
    } catch (err) {
      console.error('Erreur messages:', err);
      
      // Fallback avec HTML simple pour debug
      res.send(`
        <h1>Messages Admin</h1>
        <p><strong>Erreur:</strong> ${err.message}</p>
        <p><strong>Stack:</strong> ${err.stack}</p>
        <hr>
        <p>Vérifiez que:</p>
        <ul>
          <li>DATABASE_URL est configuré dans Railway</li>
          <li>La base PostgreSQL est connectée</li>
          <li>Des messages ont été envoyés via le formulaire</li>
        </ul>
        <p><a href="/debug-messages">Tester la création de message</a></p>
        <p><a href="/admin">Retour Dashboard</a></p>
      `);
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
  
  app.get('/admin/stats', async (req, res) => {
    if (!req.session?.user) return res.redirect('/admin/login');
    
    try {
      const { Visitor } = require('./models/index');
      const { Op } = require('sequelize');
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const stats = {
        visitorsToday: await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfDay } }
        }),
        visitorsThisWeek: await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfWeek } }
        }),
        visitorsThisMonth: await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfMonth } }
        }),
        totalVisitors: await Visitor.count(),
        uniqueVisitorsToday: await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfDay } },
          distinct: true,
          col: 'ip'
        })
      };
      
      // Pages les plus visitées
      const topPages = await Visitor.findAll({
        attributes: [
          'page',
          [require('sequelize').fn('COUNT', require('sequelize').col('page')), 'visits']
        ],
        group: ['page'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('page')), 'DESC']],
        limit: 10
      });
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Statistiques - ENNO Admin</title>
          <meta charset="utf-8">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="container mt-4">
            <h1>📊 Statistiques Détaillées</h1>
            <a href="/admin" class="btn btn-secondary mb-4">← Retour Dashboard</a>
            
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h2 class="text-primary">${stats.visitorsToday}</h2>
                    <p>Visiteurs aujourd'hui</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h2 class="text-success">${stats.visitorsThisWeek}</h2>
                    <p>Visiteurs cette semaine</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h2 class="text-warning">${stats.visitorsThisMonth}</h2>
                    <p>Visiteurs ce mois</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h2 class="text-info">${stats.totalVisitors}</h2>
                    <p>Total visiteurs</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>Pages les plus visitées</h5>
                  </div>
                  <div class="card-body">
                    ${topPages.map(page => `
                      <div class="d-flex justify-content-between">
                        <span>${page.page}</span>
                        <span class="badge bg-primary">${page.dataValues.visits}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>Visiteurs uniques aujourd'hui</h5>
                  </div>
                  <div class="card-body text-center">
                    <h2 class="text-primary">${stats.uniqueVisitorsToday}</h2>
                    <p>IP uniques</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.send(`<h1>Statistiques</h1><p>Erreur: ${err.message}</p><a href="/admin">Retour</a>`);
    }
  });) {
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
  
  // TEST DE CONNEXION IMMÉDIAT
  try {
    const { sequelize } = require('./models/index');
    
    console.log('🔌 Test de connexion PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté (Railway)');
    
    // Initialiser la base de données
    const { Admin, Content, ContactMessage, Service, Visitor, Projet } = require('./models/index');
    const bcrypt = require('bcrypt');
    
    console.log('🔄 Synchronisation de la base de données...');
    
    // Forcer la synchronisation de toutes les tables
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée avec alter: true');
    
    // Vérifier les tables créées
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Tables créées: ${tables.join(', ')}`);
    
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
    
    // Créer un message de test si aucun message n'existe
    const messageCount = await ContactMessage.count();
    if (messageCount === 0) {
      await ContactMessage.create({
        name: 'Message de bienvenue',
        email: 'contact@enno.com',
        phone: '+242000000000',
        subject: 'Bienvenue sur ENNO Admin',
        message: 'Ceci est un message de test pour vérifier que le système fonctionne correctement.',
        status: 'unread'
      });
      console.log('✅ Message de test créé');
    }
    
    console.log('✅ Contenu par défaut créé');
    console.log('🎉 Initialisation terminée');
    
  } catch (error) {
    console.error('❌ PostgreSQL KO:', error.message);
    console.error('❌ Type d\'erreur:', error.name);
    console.error('❌ Stack complète:', error.stack);
    
    // Diagnostic détaillé
    console.log('\n🔍 DIAGNOSTIC RAILWAY:');
    console.log(`DATABASE_URL présent: ${!!process.env.DATABASE_URL}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.log('\n🚨 CONNEXION REFUSÉE - VÉRIFIEZ:');
      console.log('1. Service PostgreSQL démarré dans Railway');
      console.log('2. DATABASE_URL configuré dans les variables');
      console.log('3. Services liés dans le même projet');
      console.log('4. SSL activé pour Railway');
    }
  }
});