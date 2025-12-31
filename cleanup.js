const fs = require('fs');
const path = require('path');

// Fichiers et dossiers à supprimer
const filesToDelete = [
  'test-api.js',
  'sync-db.js', 
  'add-content.js',
  'server-working.js',
  'admin/dashboard.ejs',
  'admin/login.ejs',
  'src/models/user.js',
  'src/models/Message.js',
  'src/routes/auth.js',
  'src/routes/content.js',
  'src/routes/message.js',
  'src/routes/public.js',
  'src/controllers/messageController.js',
  'src/controllers/publicController.js',
  'src/createAdmin.js'
];

console.log('🧹 Nettoyage des fichiers inutiles...');

filesToDelete.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Supprimé: ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  Erreur suppression ${file}:`, error.message);
  }
});

console.log('✨ Nettoyage terminé');