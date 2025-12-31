const { Service } = require('../models/index');

// Lister tous les services
exports.listServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.render('admin/services', {
      title: 'Gestion des services',
      services,
      user: req.session.user
    });
  } catch (error) {
    console.error('Erreur listServices:', error);
    res.status(500).render('admin/services', {
      title: 'Gestion des services',
      services: [],
      user: req.session.user,
      error: 'Erreur lors du chargement des services'
    });
  }
};

// Afficher le formulaire de création
exports.createServiceForm = (req, res) => {
  res.render('admin/service-form', {
    title: 'Créer un service',
    service: null,
    user: req.session.user
  });
};

// Créer un service
exports.createService = async (req, res) => {
  try {
    const { title, description, imageUrl, category, duration } = req.body;
    
    await Service.create({
      title,
      description,
      imageUrl: imageUrl || null,
      category: category || null,
      duration: duration || null
    });
    
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Erreur createService:', error);
    res.render('admin/service-form', {
      title: 'Créer un service',
      service: req.body,
      user: req.session.user,
      error: 'Erreur lors de la création du service'
    });
  }
};

// Afficher le formulaire d'édition
exports.editServiceForm = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).render('admin/404', {
        title: 'Service non trouvé',
        user: req.session.user
      });
    }
    
    res.render('admin/service-form', {
      title: 'Modifier le service',
      service,
      user: req.session.user
    });
  } catch (error) {
    console.error('Erreur editServiceForm:', error);
    res.redirect('/admin/services');
  }
};

// Mettre à jour un service
exports.updateService = async (req, res) => {
  try {
    const { title, description, imageUrl, category, duration } = req.body;
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).render('admin/404', {
        title: 'Service non trouvé',
        user: req.session.user
      });
    }
    
    await service.update({
      title,
      description,
      imageUrl: imageUrl || null,
      category: category || null,
      duration: duration || null
    });
    
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Erreur updateService:', error);
    res.render('admin/service-form', {
      title: 'Modifier le service',
      service: req.body,
      user: req.session.user,
      error: 'Erreur lors de la mise à jour du service'
    });
  }
};

// Supprimer un service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    await service.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteService:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};