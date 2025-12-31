# 🌐 Site Web ENNO

Site officiel de l'entreprise ENNO avec espace d'administration complet.

## 🚀 Installation Rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
Créer une base PostgreSQL nommée `enno_website` et configurer le fichier `.env` :

```env
# Base de données
DB_HOST=localhost
DB_NAME=enno_website
DB_USER=postgres
DB_PASS=votre_mot_de_passe
DATABASE_URL=postgres://postgres:votre_mot_de_passe@localhost/enno_website

# Email (Outlook)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
ADMIN_EMAIL=admin@enno.com

# Session
SESSION_SECRET=enno-super-secret-key-2024

# Serveur
PORT=3000
NODE_ENV=development
```

### 3. Installation complète automatique
```bash
npm run install-complete
```

**OU étape par étape :**
```bash
npm run migrate    # Créer les tables
npm run setup      # Configurer l'admin
npm run dev        # Démarrer le serveur
```

## 👨💼 Accès Administration

- **URL** : http://localhost:3000/admin/login
- **Email** : admin@enno.com
- **Mot de passe** : admin123

## 📋 Fonctionnalités

### 🌐 Site Public
- ✅ Page d'accueil avec présentation
- ✅ Page services avec liste complète
- ✅ Page à propos de l'entreprise
- ✅ Formulaire de contact fonctionnel
- ✅ Design responsive (mobile/tablette/desktop)

### 👨💼 Administration
- ✅ Connexion sécurisée
- ✅ Dashboard avec statistiques
- ✅ Gestion des contenus (accueil, services, à propos)
- ✅ Gestion des services (CRUD complet)
- ✅ Consultation des messages clients
- ✅ Upload et gestion des images
- ✅ Statistiques de fréquentation

### 📊 Statistiques Avancées
- ✅ Compteur de visiteurs (jour/semaine/mois/total)
- ✅ Visiteurs uniques
- ✅ Pages les plus visitées
- ✅ Tracking automatique

### 📧 Système de Messagerie
- ✅ Formulaire de contact avec validation
- ✅ Envoi d'emails automatique à l'admin
- ✅ Gestion des messages dans l'admin
- ✅ Statuts des messages (lu/non-lu)

### 🖼️ Gestion d'Images
- ✅ Upload sécurisé (JPG, PNG, GIF, WebP)
- ✅ Prévisualisation avant upload
- ✅ Suppression et organisation
- ✅ Copie d'URL pour utilisation

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Démarrer en mode développement
npm start               # Démarrer en production
npm run setup           # Configurer l'admin
npm run migrate         # Exécuter les migrations
npm run create-admin    # Créer un admin (ancien script)
npm run install-complete # Installation complète automatique
```

## 📁 Structure du Projet

```
enno-website/
├── src/
│   ├── controllers/     # Contrôleurs (logique métier)
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes de l'application
│   ├── middlewares/    # Middlewares personnalisés
│   ├── migrations/     # Migrations de base de données
│   ├── utils/          # Utilitaires (email, etc.)
│   └── server.js       # Serveur principal
├── views/              # Templates EJS
│   ├── admin/          # Pages d'administration
│   └── partials/       # Composants réutilisables
├── public/             # Fichiers statiques
│   ├── css/            # Styles CSS
│   ├── js/             # Scripts JavaScript
│   └── images/         # Images du site
└── package.json        # Configuration npm
```

## 🔧 Configuration Email

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Gmail (alternative)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Note** : Pour Gmail, utilisez un mot de passe d'application si l'authentification 2FA est activée.

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=80
SESSION_SECRET=votre-clé-secrète-très-sécurisée
DATABASE_URL=postgres://user:pass@host:port/database
```

### Commandes de déploiement
```bash
npm install --production
npm run migrate
npm run setup
npm start
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la configuration de la base de données
2. Vérifiez les paramètres email dans `.env`
3. Consultez les logs du serveur
4. Vérifiez que toutes les migrations sont exécutées

## 🎯 Fonctionnalités Avancées

- **SEO optimisé** - URLs propres et meta descriptions
- **Sécurité renforcée** - Hashage des mots de passe, sessions sécurisées
- **Performance** - Caching, compression, index de base de données
- **Monitoring** - Logs détaillés, statistiques temps réel
- **Responsive** - Compatible tous appareils
- **Moderne** - Bootstrap 5, FontAwesome, interface intuitive

---

**🎉 Le site ENNO est maintenant prêt à l'emploi !**