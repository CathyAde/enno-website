const fs = require('fs');
const path = require('path');

// Simuler l'upload d'images
exports.uploadImage = (req, res, next) => {
  // Middleware simulé - en production, utiliser multer
  next();
};

exports.handleImageUpload = (req, res) => {
  try {
    // Simulation d'upload réussi
    const files = req.files || [];
    const uploadedFiles = [];
    
    // Simuler la sauvegarde des fichiers
    for (let i = 0; i < (files.length || 1); i++) {
      uploadedFiles.push({
        filename: `image_${Date.now()}_${i}.jpg`,
        path: `/images/uploads/image_${Date.now()}_${i}.jpg`
      });
    }
    
    res.json({
      success: true,
      message: 'Images uploadées avec succès',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des images'
    });
  }
};

exports.listImages = (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../../public/images');
    const uploadsDir = path.join(imagesDir, 'uploads');
    
    let images = [];
    
    // Lister les images du dossier principal
    if (fs.existsSync(imagesDir)) {
      const mainFiles = fs.readdirSync(imagesDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          name: file,
          url: `/images/${file}`,
          size: '32 KB'
        }));
      images = images.concat(mainFiles);
    }
    
    // Lister les images uploadées
    if (fs.existsSync(uploadsDir)) {
      const uploadedFiles = fs.readdirSync(uploadsDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          name: file,
          url: `/images/uploads/${file}`,
          size: '45 KB'
        }));
      images = images.concat(uploadedFiles);
    }
    
    res.json(images);
  } catch (error) {
    console.error('Erreur listImages:', error);
    res.json([]);
  }
};

exports.deleteImage = (req, res) => {
  try {
    const filename = req.params.filename;
    // Simulation de suppression
    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteImage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};