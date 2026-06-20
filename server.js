const express = require('express');
const axios = require('axios');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.json());

// ─── CONFIG ────────────────────────────────────────────────
const CONFIG = {
  DISCORD_CLIENT_ID: '1517862326773223454',
  DISCORD_CLIENT_SECRET: 'fFTxU6-Z5PDalPHiXVKbLntNxqpAhP8y',
  REDIRECT_URI: 'http://localhost:3000/auth/discord/callback',
  SESSION_SECRET: 'change_moi_en_prod',
  PORT: 3000,
};
// ────────────────────────────────────────────────────────────

app.use(session({
  secret: CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 jours
}));

// Sert le front-end (index.html dans le dossier parent)
app.use(express.static(path.join(__dirname, '..')));

// ── ÉTAPE 1 : Redirige l'utilisateur vers Discord ──────────
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: CONFIG.DISCORD_CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// ── ÉTAPE 2 : Discord redirige ici avec un "code" ──────────
app.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    // Échange le code contre un access token
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CONFIG.DISCORD_CLIENT_ID,
        client_secret: CONFIG.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: CONFIG.REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;

    // Récupère les infos de l'utilisateur Discord
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userRes.data;

    // Sauvegarde en session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`,
    };

    res.redirect('/?login=success');
  } catch (err) {
    console.error('Erreur OAuth Discord :', err.response?.data || err.message);
    res.redirect('/?error=oauth_failed');
  }
});

// ── ÉTAPE 3 : Endpoint pour récupérer l'utilisateur connecté
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non connecté' });
  }
  res.json(req.session.user);
});

// ── Déconnexion ─────────────────────────────────────────────
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(CONFIG.PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${CONFIG.PORT}`);
});
