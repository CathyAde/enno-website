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

app.get('/admin/dashboard', (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }
  
  res.send(`
    <h1>🚆 Dashboard ENNO Railway</h1>
    <p>Bienvenue ${req.session.user.name}</p>
    <ul>
      <li><a href="/debug-messages">Debug Messages</a></li>
      <li><a href="/admin/messages">Messages</a></li>
      <li><a href="/admin/logout">Déconnexion</a></li>
    </ul>
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

// Routes principales
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Essayer de charger les routes admin (optionnel)
try {
  const adminRoutes = require('./routes/admin');
  console.log('✅ Routes admin chargées depuis le fichier');
} catch (error) {
  console.log('⚠️ Routes admin de secours activées');
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