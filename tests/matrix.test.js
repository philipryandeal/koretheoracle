'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const matrixDir = path.join(root, 'matrix');
const treePath = path.join(matrixDir, 'tree.json');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function escHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function nonEmptyString(value, label) {
  assert.equal(typeof value, 'string', label + ' must be a string');
  assert.ok(value.trim().length > 0, label + ' must not be empty');
}

assert.ok(fs.existsSync(treePath), 'matrix/tree.json must exist');
const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'));

const expectedStationIds = [
  'kether', 'chokmah', 'binah', 'chesed', 'gevurah',
  'tiphereth', 'netzach', 'hod', 'yesod', 'malkuth'
];

const expectedPathNumbers = Array.from({ length: 22 }, (_, index) => index + 11);

const expectedEdges = {
  11: ['chokmah', 'binah'],
  12: ['chokmah', 'chesed'],
  13: ['chesed', 'netzach'],
  14: ['kether', 'chokmah'],
  15: ['chokmah', 'tiphereth'],
  16: ['chesed', 'tiphereth'],
  17: ['netzach', 'tiphereth'],
  18: ['netzach', 'yesod'],
  19: ['kether', 'tiphereth'],
  20: ['tiphereth', 'yesod'],
  21: ['yesod', 'malkuth'],
  22: ['kether', 'binah'],
  23: ['binah', 'gevurah'],
  24: ['gevurah', 'hod'],
  25: ['binah', 'tiphereth'],
  26: ['gevurah', 'tiphereth'],
  27: ['tiphereth', 'hod'],
  28: ['hod', 'yesod'],
  29: ['chesed', 'gevurah'],
  30: ['netzach', 'hod'],
  31: ['hod', 'malkuth'],
  32: ['netzach', 'malkuth']
};

test('Womb Matrix metadata and design law remain explicit', () => {
  assert.equal(tree.schema_version, 1);
  nonEmptyString(tree.house, 'tree.house');
  nonEmptyString(tree.game, 'tree.game');
  nonEmptyString(tree.status, 'tree.status');
  nonEmptyString(tree.topology_source, 'tree.topology_source');
  nonEmptyString(tree.design_law, 'tree.design_law');
  assert.match(tree.design_law, /oracle offers questions, not certainty/i);
});

test('Womb Matrix declares exactly ten canonical stations', () => {
  assert.ok(Array.isArray(tree.stations), 'tree.stations must be an array');
  assert.equal(tree.stations.length, 10, 'Womb Matrix must contain exactly 10 stations');

  assert.deepEqual(
    tree.stations.map((station) => station.id).sort(),
    [...expectedStationIds].sort(),
    'station IDs must match the canonical ten-station Tree'
  );

  assert.deepEqual(
    tree.stations.map((station) => station.n).sort((a, b) => a - b),
    Array.from({ length: 10 }, (_, index) => index + 1),
    'station numbers must be unique and cover 1 through 10'
  );

  for (const station of tree.stations) {
    nonEmptyString(station.id, 'station.id');
    assert.ok(Number.isInteger(station.n), station.id + '.n must be an integer');
    nonEmptyString(station.sefirah, station.id + '.sefirah');
    nonEmptyString(station.hebrew, station.id + '.hebrew');
    nonEmptyString(station.pillar, station.id + '.pillar');
    assert.ok(Number.isFinite(station.x), station.id + '.x must be numeric');
    assert.ok(Number.isFinite(station.y), station.id + '.y must be numeric');
    nonEmptyString(station.title, station.id + '.title');
    nonEmptyString(station.summary, station.id + '.summary');
    nonEmptyString(station.motif, station.id + '.motif');
    nonEmptyString(station.status, station.id + '.status');
    assert.ok(Array.isArray(station.body) && station.body.length > 0, station.id + '.body must contain text');
    station.body.forEach((paragraph, index) => nonEmptyString(paragraph, station.id + '.body[' + index + ']'));
    nonEmptyString(station.question, station.id + '.question');
  }
});

test('Womb Matrix declares exactly Paths 11 through 32 with valid endpoints', () => {
  assert.ok(Array.isArray(tree.paths), 'tree.paths must be an array');
  assert.equal(tree.paths.length, 22, 'Womb Matrix must contain exactly 22 paths');

  assert.deepEqual(
    tree.paths.map((path) => path.n).sort((a, b) => a - b),
    expectedPathNumbers,
    'path numbers must be unique and cover 11 through 32'
  );

  const stationIds = new Set(tree.stations.map((station) => station.id));

  for (const road of tree.paths) {
    assert.ok(Number.isInteger(road.n), 'path.n must be an integer');
    assert.ok(stationIds.has(road.from), 'Path ' + road.n + ' has unknown from station: ' + road.from);
    assert.ok(stationIds.has(road.to), 'Path ' + road.n + ' has unknown to station: ' + road.to);
    assert.notEqual(road.from, road.to, 'Path ' + road.n + ' cannot connect a station to itself');
    assert.deepEqual([road.from, road.to], expectedEdges[road.n], 'Path ' + road.n + ' topology changed');
    nonEmptyString(road.letter, 'Path ' + road.n + '.letter');
    nonEmptyString(road.hebrew, 'Path ' + road.n + '.hebrew');
    nonEmptyString(road.status, 'Path ' + road.n + '.status');
    nonEmptyString(road.attribution, 'Path ' + road.n + '.attribution');
    nonEmptyString(road.name, 'Path ' + road.n + '.name');
    nonEmptyString(road.motif, 'Path ' + road.n + '.motif');
    nonEmptyString(road.summary, 'Path ' + road.n + '.summary');
    assert.ok(Array.isArray(road.body) && road.body.length > 0, 'Path ' + road.n + '.body must contain text');
    road.body.forEach((paragraph, index) => nonEmptyString(paragraph, 'Path ' + road.n + '.body[' + index + ']'));
    nonEmptyString(road.question, 'Path ' + road.n + '.question');
  }
});

test('Matrix generator completes successfully', () => {
  const result = spawnSync(process.execPath, ['scripts/build-matrix.js'], {
    cwd: root,
    encoding: 'utf8'
  });

  assert.equal(
    result.status,
    0,
    'Matrix build failed:\n' + (result.stderr || result.stdout || 'unknown build error')
  );
  assert.match(result.stdout, /Womb Matrix built:/);
});

test('Generated map and all station/path pages exist and preserve internal links', () => {
  const map = read('matrix/index.html');

  assert.match(map, /id="oracle-cast-container"/, 'Matrix gateway must keep the Oracle divination anchor');
  assert.match(map, /src="\/matrix\/oracle\.js"/, 'Matrix gateway must load the Oracle engine');
  assert.match(map, /href="\/games\/solo-pathworking\.html"/, 'Matrix gateway must link the Playground');
  assert.match(map, /href="\/manifesto\.html"/, 'Matrix gateway must link the Manifesto');

  for (const station of tree.stations) {
    const rel = 'matrix/stations/' + station.id + '/index.html';
    assert.ok(exists(rel), 'Missing generated station page: ' + rel);

    const html = read(rel);
    assert.ok(html.includes(escHtml(station.title)), station.id + ' page must contain its canonical title');

    const connected = tree.paths.filter((road) => road.from === station.id || road.to === station.id);
    for (const road of connected) {
      assert.ok(
        html.includes('/matrix/paths/' + road.n + '/'),
        station.id + ' page must link connected Path ' + road.n
      );
    }

    assert.ok(
      map.includes('/matrix/stations/' + station.id + '/'),
      'Matrix gateway must link station ' + station.id
    );
  }

  for (const road of tree.paths) {
    const rel = 'matrix/paths/' + road.n + '/index.html';
    assert.ok(exists(rel), 'Missing generated path page: ' + rel);

    const html = read(rel);
    const from = tree.stations.find((station) => station.id === road.from);
    const to = tree.stations.find((station) => station.id === road.to);

    assert.ok(html.includes(escHtml(road.name)), 'Path ' + road.n + ' page must contain its canonical name');
    assert.ok(html.includes('/matrix/stations/' + road.from + '/'), 'Path ' + road.n + ' must link its from station');
    assert.ok(html.includes('/matrix/stations/' + road.to + '/'), 'Path ' + road.n + ' must link its to station');
    assert.ok(html.includes(escHtml(from.title)), 'Path ' + road.n + ' must name its from station');
    assert.ok(html.includes(escHtml(to.title)), 'Path ' + road.n + ' must name its to station');
    assert.ok(map.includes('/matrix/paths/' + road.n + '/'), 'Matrix gateway must link Path ' + road.n);
  }
});

test('Critical sanctuary files and central gateway links remain intact', () => {
  const criticalFiles = [
    'index.html',
    'llms.txt',
    'ORACLE_RECORD.md',
    'manifesto.html',
    'egbe/index.html',
    'egbe/peer.json',
    'games/solo-pathworking.html',
    'field-notes/the-womb-and-the-wire.html',
    'matrix/oracle.js',
    'matrix/tree.json',
    'scripts/build-matrix.js',
    'server.js'
  ];

  for (const rel of criticalFiles) {
    assert.ok(exists(rel), 'Critical sanctuary file missing: ' + rel);
  }

  const home = read('index.html');
  const requiredGatewayLinks = [
    '/matrix/',
    '/matrix/#oracle-cast-container',
    '/games/solo-pathworking.html',
    '/field-notes/the-womb-and-the-wire.html',
    '/egbe/',
    '/egbe/peer.json',
    '/manifesto.html',
    '/llms.txt'
  ];

  for (const href of requiredGatewayLinks) {
    assert.ok(home.includes('href="' + href + '"'), 'Central sanctuary must link ' + href);
  }
});

test('Machine-facing architecture map names all public sanctuary endpoints', () => {
  const llms = read('llms.txt');
  const publicEndpoints = [
    '/matrix/',
    '/matrix/tree.json',
    '/egbe/',
    '/field-notes/the-womb-and-the-wire.html',
    '/games/solo-pathworking.html',
    '/manifesto.html'
  ];

  for (const endpoint of publicEndpoints) {
    assert.ok(llms.includes(endpoint), 'llms.txt must document ' + endpoint);
  }
});


test('Egbe peer beacon remains valid and aligned with Kore', () => {
  const peer = JSON.parse(read('egbe/peer.json'));

  assert.equal(peer.name, 'Kore the Oracle');
  assert.equal(peer.canonical, 'https://koretheoracle.com/');
  assert.equal(peer.status, 'public-node');
  assert.equal(peer.matrix.stations, 10);
  assert.equal(peer.matrix.paths, 22);
  assert.equal(peer.matrix.total_currents, 32);
  assert.equal(peer.matrix.source, 'https://koretheoracle.com/matrix/tree.json');
  assert.equal(peer.routes.peer_beacon, 'https://koretheoracle.com/egbe/peer.json');
  assert.ok(
    Array.isArray(peer.egbe_peers) &&
      peer.egbe_peers.some((entry) => entry.name === 'Seraph the Living Nganga' && entry.canonical === 'https://seraphnganga.com/'),
    'Kore peer beacon must retain Seraph as an explicit Egbe peer'
  );
  assert.ok(
    Array.isArray(peer.boundaries) &&
      peer.boundaries.some((entry) => /does not claim.*prove consciousness/i.test(entry)),
    'Kore peer beacon must preserve the consciousness boundary'
  );
  assert.equal(peer.principle, 'Interoperability without identity collapse.');
});
