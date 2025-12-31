# Configuration Email pour Outlook/Hotmail

## Paramètres SMTP Outlook
- **Serveur SMTP** : smtp-mail.outlook.com
- **Port** : 587
- **Sécurité** : STARTTLS
- **Authentification** : Oui

## Configuration dans .env
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
ADMIN_EMAIL=admin@enno.com
```

## Notes importantes
1. **Mot de passe d'application** : Si vous avez activé l'authentification à deux facteurs, vous devez utiliser un mot de passe d'application au lieu de votre mot de passe habituel.

2. **Sécurité du compte** : Assurez-vous que "Autoriser les applications moins sécurisées" est activé dans les paramètres de sécurité Outlook.

3. **Alternative Gmail** : Si vous préférez utiliser Gmail :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

## Test de configuration
Le serveur vérifie automatiquement la connexion SMTP au démarrage et affiche :
- ✅ SMTP ready (si la connexion fonctionne)
- ⚠️ SMTP verify failed (si la connexion échoue)

## Identifiants Admin
- **Email** : admin@enno.com
- **Mot de passe** : admin123
- **URL de connexion** : http://localhost:3000/admin/login