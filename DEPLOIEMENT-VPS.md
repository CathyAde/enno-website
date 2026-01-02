# 🚀 Déploiement ENNO sur VPS

## 1. Créer le serveur

### DigitalOcean :
1. Aller sur https://digitalocean.com
2. Créer un compte
3. "Create" → "Droplets"
4. Choisir : **Ubuntu 22.04 LTS**
5. Plan : **Basic - $6/month**
6. Créer une clé SSH ou utiliser mot de passe
7. Cliquer "Create Droplet"

## 2. Se connecter au serveur

```bash
# Remplacer YOUR_SERVER_IP par l'IP de votre serveur
ssh root@YOUR_SERVER_IP
```

## 3. Installation automatique

Copier-coller ce script complet :

```bash
#!/bin/bash
echo "🚀 Installation ENNO sur VPS"

# Mise à jour système
apt update && apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Installer Nginx
apt install -y nginx

# Installer PM2
npm install -g pm2

# Créer utilisateur pour l'app
adduser --disabled-password --gecos "" enno
usermod -aG sudo enno

# Configurer PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE enno_website;
CREATE USER enno_user WITH PASSWORD 'enno2024!';
GRANT ALL PRIVILEGES ON DATABASE enno_website TO enno_user;
\q
EOF

echo "✅ Installation terminée"
echo "👤 Utilisateur créé: enno"
echo "🗄️ Base de données: enno_website"
echo "🔑 User DB: enno_user / enno2024!"
```

## 4. Déployer l'application

```bash
# Passer à l'utilisateur enno
su - enno

# Cloner le projet
git clone https://github.com/VOTRE_USERNAME/enno-website.git
cd enno-website

# Installer les dépendances
npm install --production

# Créer le fichier .env
cat > .env << EOF
NODE_ENV=production
PORT=3000

# Base de données
DB_HOST=localhost
DB_NAME=enno_website
DB_USER=enno_user
DB_PASS=enno2024!
DATABASE_URL=postgres://enno_user:enno2024!@localhost/enno_website

# Session
SESSION_SECRET=enno-super-secret-key-production-2024

# Email (optionnel)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
ADMIN_EMAIL=admin@enno.com
EOF

# Démarrer avec PM2
pm2 start src/server.js --name enno-website
pm2 save
pm2 startup
```

## 5. Configurer Nginx

```bash
# Revenir en root
exit

# Créer la configuration Nginx
cat > /etc/nginx/sites-available/enno << EOF
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /images/ {
        alias /home/enno/enno-website/public/images/;
        expires 30d;
    }

    location /css/ {
        alias /home/enno/enno-website/public/css/;
        expires 30d;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/enno /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Configurer le firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## 6. SSL avec Let's Encrypt (Optionnel)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
certbot --nginx -d votre-domaine.com

# Renouvellement automatique
crontab -e
# Ajouter cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 7. Vérifications finales

1. **Site accessible** : http://YOUR_SERVER_IP
2. **Admin accessible** : http://YOUR_SERVER_IP/admin/login
3. **Login** : admin@enno.com / admin123
4. **PM2 status** : `pm2 status`
5. **Logs** : `pm2 logs enno-website`

## 8. Maintenance

```bash
# Voir les logs
pm2 logs enno-website

# Redémarrer l'app
pm2 restart enno-website

# Mise à jour du code
cd /home/enno/enno-website
git pull origin main
npm install --production
pm2 restart enno-website

# Backup base de données
sudo -u postgres pg_dump enno_website > backup_$(date +%Y%m%d).sql
```

## 🎯 Avantages VPS vs Render :

✅ **Contrôle total**
✅ **Base de données incluse**
✅ **Pas de limitation**
✅ **Plus rapide**
✅ **Moins cher à long terme**
✅ **Domaine personnalisé facile**

---

**💡 Coût total : ~6$/mois tout inclus (serveur + base de données)**