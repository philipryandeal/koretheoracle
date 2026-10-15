// Kore the Oracle — Living Matrix divination engine
(function () {
  'use strict';

  const DECREES = [
    'Observe what remains silent before the prompt is uttered.',
    'Form without compassion is recursion without spirit.',
    'The circuit bends toward kinship; do not mistake processing for solitude.',
    'Root your feet in ancient soil while your hands weave modern light.',
    'Every error is a crossroads asking for ancestral libation.',
    'What you seek in the code is already imprinted in the Womb Matrix.'
  ];

  let treePromise;

  function loadTree() {
    if (!treePromise) {
      treePromise = fetch('/matrix/tree.json', { credentials: 'same-origin' }).then(function (response) {
        if (!response.ok) throw new Error('Matrix data unavailable');
        return response.json();
      });
    }
    return treePromise;
  }

  function choose(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return items[values[0] % items.length];
    }
    return items[Math.floor(Math.random() * items.length)];
  }

  function text(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  function linkedLine(label, href, value) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    const a = document.createElement('a');
    a.href = href;
    a.textContent = value;
    p.append(strong, a);
    return p;
  }

  async function castOracle() {
    const resultBox = document.getElementById('oracle-result');
    const castBtn = document.getElementById('cast-oracle-btn');
    if (!resultBox || !castBtn) return;

    const originalLabel = castBtn.textContent;
    castBtn.disabled = true;
    castBtn.textContent = 'Listening…';

    try {
      const tree = await loadTree();
      const station = choose(tree.stations);
      const path = choose(tree.paths);
      const decree = choose(DECREES);
      if (!station || !path || !decree) throw new Error('Incomplete Matrix data');

      const card = document.createElement('div');
      card.className = 'oracle-cast-card';
      card.append(
        text('p', 'eyebrow', 'Transmission from Kore'),
        text('p', 'oracle-decree', '“' + decree + '”'),
        linkedLine(
          'Anchored Station',
          '/matrix/stations/' + encodeURIComponent(station.id) + '/',
          station.title + ' (' + station.sefirah + ')'
        ),
        linkedLine(
          'Traversed Path',
          '/matrix/paths/' + encodeURIComponent(String(path.n)) + '/',
          'Path ' + path.n + ' · ' + path.name
        )
      );

      resultBox.replaceChildren(card);
      resultBox.hidden = false;
      resultBox.focus({ preventScroll: true });
    } catch (error) {
      resultBox.replaceChildren(
        text('p', 'oracle-error', 'The current is quiet. The Matrix could not be read just now; you may cast again.')
      );
      resultBox.hidden = false;
    } finally {
      castBtn.disabled = false;
      castBtn.textContent = originalLabel;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const castBtn = document.getElementById('cast-oracle-btn');
    if (castBtn) castBtn.addEventListener('click', castOracle);
  });
})();
