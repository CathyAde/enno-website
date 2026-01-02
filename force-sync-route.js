// Route pour forcer la synchronisation (à supprimer après test)
router.get('/force-sync', async (req, res) => {
  try {
    const { sequelize, Admin, Content, ContactMessage } = require('../models/index');
    const bcrypt = require('bcrypt');
    
    console.log('🔄 Force sync demandée...');
    
    // Synchroniser toutes les tables
    await sequelize.sync({ force: false });
    console.log('✅ Tables synchronisées');
    
    // Créer admin si inexistant
    const adminExists = await Admin.findOne({ where: { email: 'admin@enno.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'Admin ENNO',
        email: 'admin@enno.com',
        password: hashedPassword
      });
      console.log('✅ Admin créé');
    }
    
    // Vérifier les messages
    const messageCount = await ContactMessage.count();
    console.log(`📊 Messages en base: ${messageCount}`);
    
    res.json({
      success: true,
      message: 'Synchronisation forcée terminée',
      messageCount,
      adminExists: !!adminExists
    });
  } catch (error) {
    console.error('❌ Erreur force sync:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});