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

// Routes admin de secours (si le fichier admin.js ne charge pas)
app.get('/admin/login', (req, res) => {
  try {
    res.render('admin/login', {
      title: 'Connexion Admin - ENNO',
      error: null,
      email: '',
      layout: false
    });
  } catch (error) {
    res.send(`
      <h1>Admin Login</h1>
      <form method="POST" action="/admin/login">
        <input type="email" name="email" placeholder="Email" required><br><br>
        <input type="password" name="password" placeholder="Mot de passe" required><br><br>
        <button type="submit">Se connecter</button>
      </form>
      <p>Email: admin@enno.com | Mot de passe: admin123</p>
    `);
  }
});

app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === 'admin@enno.com' && password === 'admin123') {
      req.session.user = {
        id: 1,
        email: 'admin@enno.com',
        name: 'Admin ENNO',
        isAdmin: true
      };
      return res.redirect('/admin/dashboard');
    }
    
    res.redirect('/admin/login?error=Identifiants incorrects');
  } catch (error) {
    res.redirect('/admin/login?error=Erreur de connexion');
  }
});

app.get('/admin/dashboard', async (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  
  let messagesCount = 0, servicesCount = 0, contentsCount = 0, projetsCount = 0, unreadMessages = 0;
  
  try {
    const { ContactMessage, Service, Content, Projet } = require('./models/index');
    
    messagesCount = await ContactMessage.count();
    servicesCount = await Service.count();
    contentsCount = await Content.count();
    projetsCount = await Projet.count();
    unreadMessages = await ContactMessage.count({ where: { status: 'unread' } });
  } catch (error) {
    console.log('⚠️ Dashboard sans DB:', error.message);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard Admin - ENNO</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .dashboard-container { padding: 2rem 0; }
        .welcome-card { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .stat-card { background: white; border-radius: 15px; padding: 1.5rem; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number { font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; }
        .stat-label { color: #6c757d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .menu-card { background: white; border-radius: 15px; padding: 1.5rem; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: all 0.3s; height: 100%; }
        .menu-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        .menu-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .menu-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .menu-link { text-decoration: none; color: inherit; }
        .menu-link:hover { color: inherit; }
        .text-primary-custom { color: #667eea !important; }
        .text-success-custom { color: #28a745 !important; }
        .text-warning-custom { color: #ffc107 !important; }
        .text-info-custom { color: #17a2b8 !important; }
      </style>
    </head>
    <body>
      <div class="container dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-card text-center">
          <h1 class="display-4 mb-3">🏠 Dashboard ENNO</h1>
          <p class="lead text-muted">Bienvenue ${req.session.user.name}</p>
          <small class="text-muted">Gestion complète de votre site web</small>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-number text-primary-custom">${messagesCount}</div>
              <div class="stat-label">Messages</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-number text-success-custom">${servicesCount}</div>
              <div class="stat-label">Services</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-number text-warning-custom">${contentsCount}</div>
              <div class="stat-label">Contenus</div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="stat-card">
              <div class="stat-number text-info-custom">${projetsCount}</div>
              <div class="stat-label">Projets</div>
            </div>
          </div>
        </div>

        <!-- Menu Cards -->
        <div class="row">
          <div class="col-md-4 mb-4">
            <a href="/admin/messages" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon text-primary-custom">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="menu-title">Messages</div>
                <p class="text-muted mb-0">Voir les messages (${unreadMessages} non lus)</p>
              </div>
            </a>
          </div>
          <div class="col-md-4 mb-4">
            <a href="/admin/services" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon text-success-custom">
                  <i class="fas fa-cogs"></i>
                </div>
                <div class="menu-title">Services</div>
                <p class="text-muted mb-0">Gérer les services</p>
              </div>
            </a>
          </div>
          <div class="col-md-4 mb-4">
            <a href="/admin/contents" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon text-warning-custom">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="menu-title">Contenus</div>
                <p class="text-muted mb-0">Modifier les pages</p>
              </div>
            </a>
          </div>
          <div class="col-md-4 mb-4">
            <a href="/admin/projets" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon text-info-custom">
                  <i class="fas fa-project-diagram"></i>
                </div>
                <div class="menu-title">Projets</div>
                <p class="text-muted mb-0">Gérer les projets</p>
              </div>
            </a>
          </div>
          <div class="col-md-4 mb-4">
            <a href="/admin/images" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon" style="color: #e83e8c;">
                  <i class="fas fa-images"></i>
                </div>
                <div class="menu-title">Images</div>
                <p class="text-muted mb-0">Gérer les images</p>
              </div>
            </a>
          </div>
          <div class="col-md-4 mb-4">
            <a href="/admin/logout" class="menu-link">
              <div class="menu-card">
                <div class="menu-icon" style="color: #dc3545;">
                  <i class="fas fa-sign-out-alt"></i>
                </div>
                <div class="menu-title">Déconnexion</div>
                <p class="text-muted mb-0">Se déconnecter</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Debug Link -->
        <div class="text-center mt-4">
          <a href="/debug-messages" class="btn btn-outline-light btn-sm">Debug Messages</a>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

app.get('/admin/messages', async (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  
  try {
    const { ContactMessage } = require('./models/index');
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.send(`
      <h1>📧 Messages (${messages.length})</h1>
      <a href="/admin/dashboard">← Retour Dashboard</a>
      <ul>
        ${messages.map(m => `
          <li style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
            <strong>${m.name}</strong> (${m.email})<br>
            <em>${m.subject}</em><br>
            ${m.message}<br>
            <small>Status: ${m.status} | ${m.createdAt}</small>
          </li>
        `).join('')}
      </ul>
    `);
  } catch (error) {
    res.send(`<h1>❌ Erreur Messages</h1><p>${error.message}</p>`);
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Routes admin manquantes
app.get('/admin/services', (req, res) => {
  if (!req.session?.user) return res.redirect('/admin/login');
  res.send('<h1>Services</h1><p>Fonctionnalité à venir</p><a href="/admin/dashboard">Retour</a>');
});

app.get('/admin/contents', (req, res) => {
  if (!req.session?.user) return res.redirect('/admin/login');
  res.send('<h1>Contenus</h1><p>Fonctionnalité à venir</p><a href="/admin/dashboard">Retour</a>');
});

app.get('/admin/projets', (req, res) => {
  if (!req.session?.user) return res.redirect('/admin/login');
  res.send('<h1>Projets</h1><p>Fonctionnalité à venir</p><a href="/admin/dashboard">Retour</a>');
});

app.get('/admin/images', (req, res) => {
  if (!req.session?.user) return res.redirect('/admin/login');
  res.send('<h1>Images</h1><p>Fonctionnalité à venir</p><a href="/admin/dashboard">Retour</a>');
});

// Routes principales
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Les routes admin de secours sont déjà définies ci-dessus
// Ne pas charger le fichier admin.js pour éviter les conflits
console.log('⚠️ Routes admin de secours activées');

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