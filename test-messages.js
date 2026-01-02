const { ContactMessage } = require('./src/models/index');

async function testMessages() {
  try {
    console.log('🔍 Test des messages...');
    
    // Créer un message de test
    const testMessage = await ContactMessage.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+242123456789',
      subject: 'Message de test',
      message: 'Ceci est un message de test pour vérifier le système.',
      status: 'unread'
    });
    
    console.log('✅ Message de test créé:', testMessage.id);
    
    // Lister tous les messages
    const allMessages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Total messages: ${allMessages.length}`);
    allMessages.forEach(msg => {
      console.log(`- ${msg.name}: ${msg.subject} (${msg.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testMessages();