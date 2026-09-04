const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

app.disable('x-powered-by');

const INDEX_HTML = fs
  .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replaceAll('/favicon.png?v=4', '/favicon.png?v=5')
  .replaceAll('https://philipryandeal.github.io/koretheoracle/', 'https://koretheoracle.com/');

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
  res.set('Cache-Control', 'no-cache');
  res.type('html').send(INDEX_HTML);
});

app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(404).type('html').send(INDEX_HTML);
});

app.listen(PORT, () => {
  console.log(`Kore the Oracle is listening on port ${PORT}`);
});
