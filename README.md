# aBot-DS (Bot Discord de Support)

Un bot Discord moderne pour la gestion des tickets et le support utilisateur, développé avec Discord.js et TypeScript.

## 🌟 Fonctionnalités

### Système de Tickets
- **Création de Tickets**: Les utilisateurs peuvent créer des tickets via un bouton interactif
- **Limitation**: Un seul ticket actif par utilisateur
- **Gestion Automatique**: Création de canaux dédiés avec permissions appropriées
- **Notifications Staff**: Mention automatique de l'équipe support pour chaque nouveau ticket

### Système d'Avis
- **Évaluation du Staff**: Notation de 1 à 5 étoiles
- **Commentaires**: Possibilité d'ajouter des commentaires détaillés
- **Archivage**: Stockage des avis dans un canal dédié

### Commandes de Modération
- `/clear`: Suppression en masse des messages (1-100)
- `/close`: Fermeture des tickets avec logs
- Système de logs complet pour toutes les actions

### Commandes Disponibles
- `/openticket`: Affiche le panneau de création de ticket
- `/avis`: Permet de donner un avis sur un membre du staff
- `/clear`: Supprime un nombre spécifié de messages
- `/close`: Ferme le ticket actuel

## ⚙️ Configuration

### Variables d'Environnement
Créez un fichier `.env` avec les variables suivantes, à la racine du projet:
```env
DISCORD_TOKEN=votre_token_discord
CLIENT_ID=id_de_votre_application
TICKET_CATEGORY_ID=id_categorie_tickets
STAFF_ROLE_ID=id_role_staff
LOG_CHANNEL_ID=id_canal_logs
AVIS_CHANNEL_ID=id_canal_avis
```

### Installation
```bash
# Installation des dépendances
npm install

# Compilation TypeScript
npm run build

# Déploiement des commandes slash
npm run deploy

# Démarrage du bot
npm start

# Mode développement
npm run dev
```

## 🔒 Sécurité
- Vérification des permissions pour les commandes sensibles
- Système de logs pour tracer toutes les actions
- Messages éphémères pour les réponses sensibles

## 🛠️ Technologies
- TypeScript
- Discord.js v14
- Node.js
- dotenv

## 📝 Notes
- Les tickets sont nommés selon le format: `ticket-username`
- Les messages de plus de 14 jours ne peuvent pas être supprimés (limitation Discord)
- Les commandes slash sont automatiquement déployées via le script `deploy-commands.ts`
