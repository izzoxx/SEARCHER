# NovaSearch — Back-end OAuth2 Discord

## Structure des fichiers

```
projet/
├── index.html          ← ton front-end
└── backend/
    ├── server.js       ← serveur Express
    ├── package.json
    └── README.md
```

## 1. Créer une application Discord

1. Va sur https://discord.com/developers/applications
2. Clique **"New Application"** → donne un nom
3. Dans le menu **OAuth2** → **Redirects** → ajoute :
   ```
   http://localhost:3000/auth/discord/callback
   ```
4. Copie le **Client ID** et le **Client Secret**

## 2. Configurer le serveur

Ouvre `server.js` et remplis :
```js
DISCORD_CLIENT_ID: 'COLLE_TON_CLIENT_ID',
DISCORD_CLIENT_SECRET: 'COLLE_TON_CLIENT_SECRET',
```

## 3. Installer et lancer

```bash
cd backend
npm install
npm run dev     # avec rechargement automatique
# ou
npm start       # en production
```

Le site est accessible sur http://localhost:3000

## 4. En production

- Change `REDIRECT_URI` par ton vrai domaine :
  ```
  https://monsite.com/auth/discord/callback
```
- Mets `cookie: { secure: true }` dans la config session
- Change `SESSION_SECRET` par une vraie clé aléatoire
- Ajoute la nouvelle redirect dans le portail Discord
