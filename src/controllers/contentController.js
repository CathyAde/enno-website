const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'projet-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// src/controllers/contentController.js
const { Op } = require('sequelize');
const { Content, Projet } = require('../models/index');

// Fonction utilitaire pour valider les données
const validateContentData = (title, text) => {
  const errors = [];
  if (!title?.trim()) errors.push('Le titre est obligatoire');
  if (!text?.trim()) errors.push('Le contenu est obligatoire');
  return errors;
};

// Fonction utilitaire pour normaliser les valeurs
const normalizeValue = (value) => {
  return value?.trim() || null;
};

// Fonction utilitaire pour vérifier l'unicité
const checkUniqueness = async (page, section, excludeId = null) => {
  if (!page && !section) return null;
  
  const whereConditions = [];
  if (page) whereConditions.push({ page });
  if (section) whereConditions.push({ section });
  
  const where = {
    [Op.or]: whereConditions
  };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  
  return await Content.findOne({ where });
};

exports.newContentForm = (req, res) => {
  res.render('admin/editContent', {
    title: 'Nouveau contenu',
    content: null
  });
};

exports.createContent = async (req, res) => {
  try {
    const { title, text, page, section } = req.body;
    
    // Validation
    const errors = validateContentData(title, text);
    if (errors.length > 0) {
      req.flash('error', errors.join(', '));
      return res.redirect('back');
    }

    // Normaliser les valeurs
    const normalizedPage = normalizeValue(page);
    const normalizedSection = normalizeValue(section);

    // Vérifier l'unicité
    const existingContent = await checkUniqueness(normalizedPage, normalizedSection);
    if (existingContent) {
      req.flash('error', 'Un contenu avec cette page ou section existe déjà');
      return res.redirect('back');
    }

    // Créer le contenu
    await Content.create({
      title: title.trim(),
      text: text.trim(),
      page: normalizedPage,
      section: normalizedSection
    });

    req.flash('success', 'Contenu créé avec succès');
    res.redirect('/admin/contents');
  } catch (err) {
    console.error('Erreur createContent:', err);
    req.flash('error', 'Erreur lors de la création du contenu');
    res.redirect('/admin/contents');
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { title, text, page, section } = req.body;
    const contentId = req.params.id;
    
    // Validation
    const errors = validateContentData(title, text);
    if (errors.length > 0) {
      req.flash('error', errors.join(', '));
      return res.redirect('back');
    }

    // Normaliser les valeurs
    const normalizedPage = normalizeValue(page);
    const normalizedSection = normalizeValue(section);

    // Vérifier l'unicité
    const existingContent = await checkUniqueness(normalizedPage, normalizedSection, contentId);
    if (existingContent) {
      req.flash('error', 'Un autre contenu avec cette page ou section existe déjà');
      return res.redirect('back');
    }

    // Mettre à jour le contenu
    const [updatedRows] = await Content.update(
      { 
        title: title.trim(), 
        text: text.trim(), 
        page: normalizedPage, 
        section: normalizedSection 
      },
      { where: { id: contentId } }
    );

    if (updatedRows === 0) {
      req.flash('error', 'Contenu non trouvé');
      return res.redirect('/admin/contents');
    }

    req.flash('success', 'Contenu mis à jour avec succès');
    res.redirect('/admin/contents');
  } catch (err) {
    console.error('Erreur updateContent:', err);
    req.flash('error', 'Erreur lors de la mise à jour du contenu');
    res.redirect('/admin/contents');
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const contentId = req.params.id;
    const deletedRows = await Content.destroy({ where: { id: contentId } });
    
    if (deletedRows === 0) {
      req.flash('error', 'Contenu non trouvé');
    } else {
      req.flash('success', 'Contenu supprimé avec succès');
    }
    
    res.redirect('/admin/contents');
  } catch (err) {
    console.error('Erreur deleteContent:', err);
    req.flash('error', 'Erreur lors de la suppression du contenu');
    res.redirect('/admin/contents');
  }
};
exports.listContents = async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['updatedAt', 'DESC']]
    });
    
    res.render('admin/contents', {
      title: 'Gestion des contenus',
      contents: contents.map(c => c.get({ plain: true }))
    });
  } catch (err) {
    console.error('Erreur listContents:', err);
    req.flash('error', 'Erreur lors de la récupération des contenus');
    res.status(500).render('error', { 
      title: 'Erreur', 
      error: 'Erreur lors de la récupération des contenus' 
    });
  }
};

// Routes legacy - À supprimer après migration complète
exports.editPage = async (req, res) => {
  try {
    const { page } = req.params;
    const content = await Content.findOne({ where: { page } });

    res.render('admin/editContent', {
      title: `Modifier ${page}`,
      content: content ? content.get({ plain: true }) : null,
      isLegacy: true
    });
  } catch (err) {
    console.error('Erreur editPage:', err);
    req.flash('error', 'Erreur lors du chargement du contenu');
    res.redirect('/admin/contents');
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { page } = req.params;
    const { title, text, section } = req.body;

    // Validation
    const errors = validateContentData(title, text);
    if (errors.length > 0) {
      req.flash('error', errors.join(', '));
      return res.redirect('back');
    }

    await Content.upsert({
      page,
      section: normalizeValue(section),
      title: title.trim(),
      text: text.trim()
    });

    req.flash('success', 'Contenu enregistré');
    res.redirect('back');
  } catch (err) {
    console.error('Erreur updatePage:', err);
    req.flash('error', 'Erreur lors de la mise à jour du contenu');
    res.redirect('back');
  }
};

exports.editContentForm = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      req.flash('error', 'Contenu non trouvé');
      return res.redirect('/admin/contents');
    }
    
    res.render('admin/editContent', {
      title: 'Modifier le contenu',
      content: content.get({ plain: true })
    });
  } catch (err) {
    console.error('Erreur editContentForm:', err);
    req.flash('error', 'Erreur lors du chargement du contenu');
    res.redirect('/admin/contents');
  }
};

// Nouvelles méthodes pour la gestion des contenus par page
exports.editPageContent = async (req, res) => {
  try {
    const page = req.params.page || req.path.split('/').pop();
    console.log('Editing page content for:', page);
    
    let content = null;
    
    try {
      if (Content) {
        content = await Content.findOne({ where: { page } });
        console.log('Contenu trouvé:', content ? 'Oui' : 'Non');
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour le contenu');
    }

    res.render('admin/contents', {
      title: `Gestion - ${page}`,
      page,
      content: content ? content.get({ plain: true }) : null,
      admin: req.session.user,
      layout: false
    });
  } catch (err) {
    console.error('Erreur editPageContent:', err);
    res.status(500).send('Erreur lors du chargement du contenu');
  }
};

exports.updatePageContent = async (req, res) => {
  try {
    const { page } = req.params;
    const { title, subtitle, text } = req.body;
    let imagePath = null;
    
    // Si une image a été uploadée
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
    }

    try {
      if (Content) {
        const updateData = {
          page,
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          text: text.trim()
        };
        
        // Ajouter l'image seulement si une nouvelle a été uploadée
        if (imagePath) {
          updateData.image = imagePath;
        }
        
        await Content.upsert(updateData);
        req.flash('success', 'Contenu mis à jour avec succès');
      } else {
        req.flash('error', 'Base de données non disponible');
      }
    } catch (dbError) {
      console.error('Erreur DB updatePageContent:', dbError);
      req.flash('error', 'Erreur lors de la mise à jour');
    }

    res.redirect(`/admin/contents/${page}`);
  } catch (err) {
    console.error('Erreur updatePageContent:', err);
    req.flash('error', 'Erreur lors de la mise à jour');
    res.redirect(`/admin/contents/${req.params.page}`);
  }
};

// Gestion des projets réalisés
exports.listProjets = async (req, res) => {
  try {
    let projets = [];
    
    try {
      if (Projet) {
        projets = await Projet.findAll({
          order: [['date', 'DESC']]
        });
      }
    } catch (dbError) {
      console.log('Base de données non disponible pour les projets');
    }
    
    res.render('admin/projets', {
      title: 'Projets réalisés',
      projets,
      admin: req.session.user,
      layout: false
    });
  } catch (err) {
    console.error('Erreur listProjets:', err);
    req.flash('error', 'Erreur lors du chargement des projets');
    res.redirect('/admin');
  }
};

exports.createProjet = async (req, res) => {
  try {
    const { title, description, date, client } = req.body;
    let imagePath = null;
    
    console.log('Création projet:', { title, description, date, client });
    
    // Si une image a été uploadée
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
      console.log('Image uploadée:', imagePath);
    }
    
    try {
      if (Projet) {
        const nouveauProjet = await Projet.create({
          title: title.trim(),
          description: description.trim(),
          image: imagePath,
          date,
          client: client?.trim() || null
        });
        console.log('Projet créé avec ID:', nouveauProjet.id);
        req.flash('success', 'Projet ajouté avec succès');
      } else {
        console.log('Modèle Projet non disponible');
        req.flash('error', 'Base de données non disponible');
      }
    } catch (dbError) {
      console.error('Erreur DB createProjet:', dbError);
      req.flash('error', 'Erreur lors de la création du projet');
    }
    
    res.redirect('/admin/projets');
  } catch (err) {
    console.error('Erreur createProjet:', err);
    req.flash('error', 'Erreur lors de la création du projet');
    res.redirect('/admin/projets');
  }
};

exports.updateProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, client } = req.body;
    let imagePath = null;
    
    // Si une image a été uploadée
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
    }
    
    try {
      if (Projet) {
        const updateData = {
          title: title.trim(),
          description: description.trim(),
          date,
          client: client?.trim() || null
        };
        
        // Ajouter l'image seulement si une nouvelle a été uploadée
        if (imagePath) {
          updateData.image = imagePath;
        }
        
        await Projet.update(updateData, { where: { id } });
        req.flash('success', 'Projet modifié avec succès');
      } else {
        req.flash('error', 'Base de données non disponible');
      }
    } catch (dbError) {
      console.error('Erreur DB updateProjet:', dbError);
      req.flash('error', 'Erreur lors de la modification du projet');
    }
    
    res.redirect('/admin/projets');
  } catch (err) {
    console.error('Erreur updateProjet:', err);
    req.flash('error', 'Erreur lors de la modification du projet');
    res.redirect('/admin/projets');
  }
};

// Middleware pour l'upload d'image
exports.uploadImage = upload.single('image');

exports.deleteProjet = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      if (Projet) {
        await Projet.destroy({ where: { id } });
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, message: 'Base de données non disponible' });
      }
    } catch (dbError) {
      console.error('Erreur DB deleteProjet:', dbError);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
  } catch (err) {
    console.error('Erreur deleteProjet:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};
