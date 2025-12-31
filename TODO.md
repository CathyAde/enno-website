# Plan de correction de l'erreur

## Informations rassemblées
- Le modèle Message est défini différemment des autres modèles (utilise sequelize.define au lieu d'une fonction).
- Message importe sequelize depuis '../database/index', tandis que les autres sont initialisés dans models/index.js.
- Les imports dans server.js et routes/main.js sont incorrects car ils requièrent './models' mais models/index.js exporte db, pas les modèles individuels directement.

## Plan
- [x] Redéfinir Message.js pour qu'il corresponde au pattern des autres modèles (fonction prenant sequelize et DataTypes).
- [x] Mettre à jour models/index.js pour inclure Message et l'initialiser.
- [x] Corriger les imports dans server.js pour destructurer depuis l'objet db.
- [x] Corriger les imports dans routes/main.js pour destructurer depuis l'objet db.

## Étapes de suivi
- [x] Tester le serveur après les corrections pour s'assurer que tout fonctionne.
