const { Content, ContactMessage, Service, Admin, Visitor, Projet } = require('../models/index');
const { Op } = require('sequelize');

// Page de connexion admin (GET)
exports.loginForm = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }

  res.render('admin/login', {
    title: 'Connexion Admin - ENNO',
    error: null,
    email: '',
    layout: false
  });
};

// Connexion admin (POST)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Connexion simple pour test
    if (email === 'admin@enno.com' && password === 'admin123') {
      req.session.user = {
        id: 1,
        email: 'admin@enno.com',
        name: 'Admin ENNO',
        isAdmin: true,
        role: 'admin'
      };
      return res.redirect('/admin');
    }

    // Essayer avec la base de données si disponible
    try {
      if (Admin) {
        const admin = await Admin.findOne({ where: { email } });
        if (admin) {
          const bcrypt = require('bcrypt');
          const isValid = await bcrypt.compare(password, admin.password);
          if (isValid) {
            req.session.user = {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              isAdmin: true,
              role: 'admin'
            };
            return res.redirect('/admin');
          }
        }
      }
    } catch (dbError) {
      console.log('Base de données non disponible, utilisation des identifiants par défaut');
    }

    res.render('admin/login', {
      title: 'Connexion Admin - ENNO',
      error: 'Identifiants incorrects',
      email,
      layout: false
    });
  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    res.render('admin/login', {
      title: 'Connexion Admin - ENNO',
      error: 'Une erreur est survenue',
      email: req.body.email,
      layout: false
    });
  }
};

// Dashboard admin (GET)
exports.dashboard = async (req, res) => {
  try {
    // Valeurs par défaut si les modèles ne sont pas disponibles
    let messagesCount = 0;
    let contentsCount = 0;
    let servicesCount = 0;
    let projetsCount = 0;
    let unreadMessages = 0;
    let recentMessages = [];
    let stats = {
      visitorsToday: 0,
      visitorsThisWeek: 0,
      visitorsThisMonth: 0,
      totalVisitors: 0,
      uniqueVisitorsToday: 0,
      topPages: []
    };

    // Essayer de récupérer les données si les modèles existent
    try {
      if (ContactMessage) {
        messagesCount = await ContactMessage.count();
        unreadMessages = await ContactMessage.count({ where: { status: 'unread' } });
        recentMessages = await ContactMessage.findAll({ 
          order: [['createdAt', 'DESC']], 
          limit: 5 
        });
        console.log(`Messages trouvés: ${messagesCount}, Non lus: ${unreadMessages}`);
        console.log('Recent messages:', recentMessages.map(m => ({ name: m.name, subject: m.subject })));
      } else {
        console.log('ContactMessage model not available');
      }
    } catch (e) { 
      console.log('ContactMessage error:', e.message); 
    }

    try {
      if (Content) contentsCount = await Content.count();
    } catch (e) { console.log('Content non disponible'); }

    try {
      if (Service) servicesCount = await Service.count();
    } catch (e) { console.log('Service non disponible'); }

    try {
      if (Projet) projetsCount = await Projet.count();
    } catch (e) { console.log('Projet non disponible'); }

    try {
      if (Visitor) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        stats.visitorsToday = await Visitor.count({
          where: {
            createdAt: {
              [Op.gte]: startOfDay
            }
          }
        });
        
        stats.visitorsThisWeek = await Visitor.count({
          where: {
            createdAt: {
              [Op.gte]: startOfWeek
            }
          }
        });
        
        stats.visitorsThisMonth = await Visitor.count({
          where: {
            createdAt: {
              [Op.gte]: startOfMonth
            }
          }
        });
        
        stats.totalVisitors = await Visitor.count();
        
        stats.uniqueVisitorsToday = await Visitor.count({
          where: {
            createdAt: {
              [Op.gte]: startOfDay
            }
          },
          distinct: true,
          col: 'ip'
        });
        
        console.log(`Statistiques visiteurs: Aujourd'hui=${stats.visitorsToday}, Semaine=${stats.visitorsThisWeek}, Total=${stats.totalVisitors}`);
      }
    } catch (e) { 
      console.log('Visitor non disponible:', e.message); 
    }

    res.render('admin/dashboard', {
      title: 'Tableau de bord',
      admin: req.session.user,
      messagesCount,
      contentsCount,
      servicesCount,
      projetsCount,
      unreadMessages,
      recentMessages,
      stats,
      layout: false
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.render('admin/dashboard', {
      title: 'Tableau de bord',
      admin: req.session.user || { name: 'Admin' },
      messagesCount: 0,
      contentsCount: 0,
      servicesCount: 0,
      unreadMessages: 0,
      recentMessages: [],
      stats: {
        visitorsToday: 0,
        visitorsThisWeek: 0,
        visitorsThisMonth: 0,
        totalVisitors: 0,
        uniqueVisitorsToday: 0,
        topPages: []
      },
      error: 'Erreur lors du chargement du dashboard',
      layout: false
    });
  }
};

// Lister les messages (GET)
exports.listMessages = async (req, res) => {
  try {
    let messages = [];
    
    try {
      if (ContactMessage) {
        messages = await ContactMessage.findAll({
          order: [['createdAt', 'DESC']]
        });
        console.log(`Messages dans listMessages: ${messages.length}`);
      } else {
        console.log('ContactMessage model not available in listMessages');
      }
    } catch (dbError) {
      console.log('Erreur DB dans listMessages:', dbError.message);
    }

    res.render('admin/messages', {
      title: 'Messages',
      messages,
      admin: req.session.user,
      layout: false
    });
  } catch (error) {
    console.error('Erreur listMessages:', error);
    res.render('admin/messages', {
      title: 'Messages',
      messages: [],
      admin: req.session.user,
      layout: false,
      error: 'Erreur lors du chargement des messages'
    });
  }
};

// Voir un message (GET)
exports.viewMessage = async (req, res) => {
  try {
    let message = null;
    
    try {
      if (ContactMessage) {
        message = await ContactMessage.findByPk(req.params.id);
        if (message && message.status === 'unread') {
          await message.update({ status: 'read' });
        }
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour viewMessage');
    }

    if (!message) {
      return res.status(404).send('Message non trouvé');
    }

    res.render('admin/message-view', {
      title: 'Message',
      message,
      admin: req.session.user,
      layout: false
    });
  } catch (error) {
    console.error('Erreur viewMessage:', error);
    res.redirect('/admin/messages');
  }
};

// Mettre à jour le statut d'un message (POST)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);

    if (message) {
      await message.update({ status });
    }

    res.redirect('/admin/messages');
  } catch (error) {
    console.error('Erreur updateMessageStatus:', error);
    res.redirect('/admin/messages');
  }
};

// Supprimer un message (DELETE)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (message) {
      await message.destroy();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

// Lister les contenus (GET)
exports.listContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/contents', {
      title: 'Contenus',
      contents,
      admin: req.session.user
    });
  } catch (error) {
    console.error('Erreur listContent:', error);
    res.render('admin/contents', {
      title: 'Contenus',
      contents: [],
      admin: req.session.user,
      error: 'Erreur lors du chargement des contenus'
    });
  }
};

// Formulaire création contenu
exports.createContentForm = (req, res) => {
  res.render('admin/content-form', {
    title: 'Nouveau contenu',
    content: null,
    admin: req.session.user
  });
};

// Créer un contenu (POST)
exports.createContent = async (req, res) => {
  try {
    const { title, text, page } = req.body;

    await Content.create({
      title,
      text,
      page: page || 'home'
    });

    res.redirect('/admin/contents');
  } catch (error) {
    console.error('Erreur createContent:', error);
    res.render('admin/content-form', {
      title: 'Nouveau contenu',
      content: req.body,
      admin: req.session.user,
      error: 'Erreur lors de la création du contenu'
    });
  }
};

// Formulaire édition contenu
exports.editContentForm = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).render('admin/404', {
        title: 'Contenu non trouvé',
        admin: req.session.user
      });
    }

    res.render('admin/content-form', {
      title: 'Modifier le contenu',
      content,
      admin: req.session.user
    });
  } catch (error) {
    console.error('Erreur editContentForm:', error);
    res.redirect('/admin/contents');
  }
};

// Mettre à jour un contenu
exports.updateContent = async (req, res) => {
  try {
    const { title, text, page } = req.body;
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).render('admin/404', {
        title: 'Contenu non trouvé',
        admin: req.session.user
      });
    }

    await content.update({
      title,
      text,
      page: page || 'home'
    });

    res.redirect('/admin/contents');
  } catch (error) {
    console.error('Erreur updateContent:', error);
    res.render('admin/content-form', {
      title: 'Modifier le contenu',
      content: req.body,
      admin: req.session.user,
      error: 'Erreur lors de la mise à jour du contenu'
    });
  }
};

// Supprimer un contenu
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (content) {
      await content.destroy();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteContent:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};
// Statistiques détaillées (GET)
exports.getStats = async (req, res) => {
  try {
    let stats = {
      visitorsToday: 0,
      visitorsThisWeek: 0,
      visitorsThisMonth: 0,
      totalVisitors: 0,
      uniqueVisitorsToday: 0,
      topPages: []
    };

    try {
      if (Visitor) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        stats.visitorsToday = await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfDay } }
        });
        
        stats.visitorsThisWeek = await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfWeek } }
        });
        
        stats.visitorsThisMonth = await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfMonth } }
        });
        
        stats.totalVisitors = await Visitor.count();
        
        stats.uniqueVisitorsToday = await Visitor.count({
          where: { createdAt: { [Op.gte]: startOfDay } },
          distinct: true,
          col: 'ip'
        });
        
        // Pages les plus visitées
        const { sequelize } = require('../models/index');
        stats.topPages = await Visitor.findAll({
          attributes: [
            'page',
            [sequelize.fn('COUNT', sequelize.col('page')), 'visits']
          ],
          group: ['page'],
          order: [[sequelize.fn('COUNT', sequelize.col('page')), 'DESC']],
          limit: 10
        });
      }
    } catch (e) {
      console.log('Erreur récupération stats:', e.message);
    }

    res.render('admin/stats', {
      title: 'Statistiques détaillées',
      admin: req.session.user,
      stats,
      layout: false
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.render('admin/stats', {
      title: 'Statistiques détaillées',
      admin: req.session.user,
      stats: {
        visitorsToday: 0,
        visitorsThisWeek: 0,
        visitorsThisMonth: 0,
        totalVisitors: 0,
        uniqueVisitorsToday: 0,
        topPages: []
      },
      error: 'Erreur lors du chargement des statistiques',
      layout: false
    });
  }
};