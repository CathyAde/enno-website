// Middleware d'authentification administrateur
module.exports = (req, res, next) => {
  // Vérifier si la session existe et si l’utilisateur est connecté
  if (!req.session || !req.session.user) {
    return res.redirect('/admin/login');
  }

  const user = req.session.user;

  // Vérifier que l'utilisateur a bien le rôle admin
  // (si ton système utilise un champ "role")
  if (user.role && user.role.toLowerCase() !== 'admin') {
    return res.redirect('/');
  }

  // Injecter l'utilisateur dans les variables locales pour les vues EJS
  res.locals.user = user;
  res.locals.admin = user;

  next();
};
