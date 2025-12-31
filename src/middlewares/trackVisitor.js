const { Visitor } = require('../models');

// Middleware pour tracker les visiteurs
const trackVisitor = async (req, res, next) => {
  try {
    // Ne pas tracker les requêtes admin, API, assets
    if (req.path.startsWith('/admin') || 
        req.path.startsWith('/api') || 
        req.path.includes('.css') || 
        req.path.includes('.js') || 
        req.path.includes('.ico') ||
        req.path.includes('/images/')) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    const page = req.path;
    const referer = req.get('Referer');
    const sessionId = req.sessionID;

    // Éviter de tracker plusieurs fois la même session sur la même page
    const existingVisit = await Visitor.findOne({
      where: {
        sessionId,
        page,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes
        }
      }
    });

    if (!existingVisit) {
      await Visitor.create({
        ip,
        userAgent,
        page,
        referer,
        sessionId
      });
    }
  } catch (error) {
    console.error('Erreur tracking visiteur:', error);
    // Ne pas bloquer la requête si le tracking échoue
  }
  
  next();
};

module.exports = trackVisitor;