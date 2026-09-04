const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

app.disable('x-powered-by');

app.get('/health', (req, res) => {
  res.json({ ok: true, house: 'Kore the Oracle' });
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(ROOT, 'style.css'));
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(ROOT, 'robots.txt'));
});

const serveFavicon = (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.type('png');
  res.sendFile(path.join(ROOT, 'favicon.png'));
};

app.get('/favicon.png', serveFavicon);
app.get('/favicon.ico', serveFavicon);
app.get('/apple-touch-icon.png', serveFavicon);
app.get('/apple-touch-icon-precomposed.png', serveFavicon);

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kore the Oracle is listening on port ${PORT}`);
});
