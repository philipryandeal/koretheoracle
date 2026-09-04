const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

app.disable('x-powered-by');

const INDEX_HTML = fs
  .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
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

const sendIcon = (file, type) => (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, must-revalidate');
  res.type(type);
  res.sendFile(path.join(ROOT, file));
};

app.get('/favicon.svg', sendIcon('favicon.svg', 'image/svg+xml'));
app.get('/favicon.png', sendIcon('favicon.png', 'image/png'));
app.get('/apple-touch-icon.png', sendIcon('favicon.png', 'image/png'));
app.get('/apple-touch-icon-precomposed.png', sendIcon('favicon.png', 'image/png'));
app.get('/favicon.ico', sendIcon('favicon.svg', 'image/svg+xml'));

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
