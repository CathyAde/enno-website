# 🚀 Guide de Déploiement - Site ENNO

## Option 1: Hébergement VPS (Recommandé)

### 1. Préparer le serveur
```bash
# Connexion SSH
ssh root@votre-serveur-ip

# Installer Node.js et PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt update && apt install -y nodejs postgresql postgresql-contrib nginx

# Créer utilisateur pour l'app
adduser enno
usermod -aG sudo enno
```

### 2. Configurer PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE enno_website;
CREATE USER enno_user WITH PASSWORD 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON DATABASE enno_website TO enno_user;
\q
```

### 3. Déployer l'application
```bash
# Se connecter en tant qu'utilisateur enno
su - enno

# Cloner ou transférer les fichiers
git clone votre-repo.git enno-website
# OU transférer via SCP/SFTP

cd enno-website

# Installer les dépendances
npm install --production

# Configurer l'environnement
cp .env.example .env
nano .env
```

### 4. Configuration .env production
```env
NODE_ENV=production
PORT=3000

# Base de données
DB_HOST=localhost
DB_NAME=enno_website
DB_USER=enno_user
DB_PASS=votre_mot_de_passe_fort
DATABASE_URL=postgres://enno_user:votre_mot_de_passe_fort@localhost/enno_website

# Email (Outlook/Gmail)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe-email
ADMIN_EMAIL=admin@enno.com

# Session (générer une clé forte)
SESSION_SECRET=votre-cle-secrete-tres-longue-et-complexe

# Serveur
PORT=3000
```

### 5. Initialiser la base de données
```bash
node -e "
const { sequelize } = require('./src/models/index');
sequelize.sync().then(() => {
  console.log('Base synchronisée');
  process.exit(0);
});
"
```

### 6. Configurer PM2 (Process Manager)
```bash
# Installer PM2
npm install -g pm2

# Créer fichier ecosystem
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'enno-website',
    script: './src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configurer Nginx
```bash
sudo nano /etc/nginx/sites-available/enno
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /images/ {
        alias /home/enno/enno-website/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /css/ {
        alias /home/enno/enno-website/public/css/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/enno /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL avec Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## Option 2: Hébergement Cloud (Heroku)

### 1. Préparer l'application
```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer app
heroku create enno-website-prod
```

### 2. Configurer la base de données
```bash
# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:mini

# Variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=votre-cle-secrete-forte
heroku config:set SMTP_HOST=smtp-mail.outlook.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=votre-email@outlook.com
heroku config:set SMTP_PASS=votre-mot-de-passe
heroku config:set ADMIN_EMAIL=admin@enno.com
```

### 3. Créer Procfile
```
web: node src/server.js
```

### 4. Déployer
```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

---

## Option 3: Hébergement Partagé (cPanel)

### 1. Préparer les fichiers
```bash
# Créer archive
tar -czf enno-website.tar.gz --exclude=node_modules .
```

### 2. Upload via cPanel
- Uploader l'archive dans public_html
- Extraire les fichiers
- Installer Node.js via cPanel (si supporté)

### 3. Configuration
- Créer base PostgreSQL/MySQL via cPanel
- Configurer .env avec les paramètres fournis
- Installer dépendances: `npm install`

---

## ✅ Vérifications Post-Déploiement

1. **Site accessible** : http://votre-domaine.com
2. **Admin accessible** : http://votre-domaine.com/admin/login
3. **Login admin** : admin@enno.com / admin123
4. **Upload d'images** fonctionne
5. **Formulaire de contact** envoie les emails
6. **Base de données** sauvegarde les données

---

## 🔧 Maintenance

```bash
# Logs PM2
pm2 logs enno-website

# Redémarrer
pm2 restart enno-website

# Mise à jour
git pull origin main
npm install
pm2 restart enno-website

# Backup base de données
pg_dump enno_website > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs`
2. Vérifier Nginx : `sudo nginx -t`
3. Vérifier PostgreSQL : `sudo systemctl status postgresql`
4. Redémarrer les services si nécessaire