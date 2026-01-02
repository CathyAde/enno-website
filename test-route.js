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