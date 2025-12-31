// src/middlewares/flash.js
module.exports = (req, res, next) => {
  // Ajouter la fonction flash à req
  req.flash = (type, message) => {
    req.session[type] = message;
  };
  
  // Récupérer les messages flash et les supprimer de la session
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  res.locals.info = req.session.info;
  res.locals.warning = req.session.warning;
  
  delete req.session.success;
  delete req.session.error;
  delete req.session.info;
  delete req.session.warning;
  
  next();
};