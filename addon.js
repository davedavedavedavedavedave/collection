window.addEventListener('load', async function () {
  const loadStylesheet = (href) => {
    return new Promise((resolve, reject) => {
      const linkEl = document.createElement('link');
      linkEl.href = href;
      linkEl.type = 'text/css';
      linkEl.rel = 'stylesheet';
      linkEl.addEventListener('load', () => resolve());
      document.getElementsByTagName('head')[0].appendChild(linkEl);
    });
  }
  const loadCollection = async (path) => {
    const resp = await fetch(path);
    return await resp.json();
  }
  const getCollections = async () => {
    const resp = await fetch('/collection/data/app.php?action=list');
    const list = await resp.json();
    const resps = await Promise.all(list.map(url => fetch(url + '?' + Math.random())));
    const collections = await Promise.all(resps.map(resp => resp.json()));
    const result = {};
    for (let i = 0; i < list.length; i++) {
      const name = list[i].replace(/^.*\/(.+)\.json/, '$1');
      result[name] = collections[i];
    }
    return result;
  }
  const getUser = async () => {
    const resp = await fetch('/collection/data/app.php?action=getMyName');
    return await resp.text();
  }
  const createCollectionInfos = (collections) => {
    // checklist view
    const tables = document.querySelectorAll('table.rwd-table');
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const header = table.querySelector('thead>tr');
      header.innerHTML += '<th>Wanted</th><th>Offered</th>';
      
      const rows = document.querySelectorAll('tbody>tr');
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        const cardId = row.querySelector('a').href.substr(-5);
        let wanted = 0;
        let offered = 0;
        let wantedBy = [];
        let offeredBy = [];
        for (const key in collections) {
          if (collections[key][cardId]?.want > 0) {
            wanted += collections[key][cardId].want;
            wantedBy.push(key + ' (' + collections[key][cardId].want + ')');
          }
          if (collections[key][cardId]?.offer > 0) {
            offered += collections[key][cardId].offer;
            offeredBy.push(key + ' (' + collections[key][cardId].offer + ')');
          }
        }
        row.innerHTML += '<td title="' + wantedBy.join(', ') + '">' + wanted + '</td>'
          +'<td title="' + offeredBy.join(', ') + '">' + offered + '</td>';
        
      }
    }
    // full card view
    const fullCards = document.querySelectorAll('.panel[class*=" border-"]');
    for (let i = 0; i < fullCards.length; i++) {
      const fullCard = fullCards[i];
      const cardId = fullCard.querySelector('a').href.substr(-5);
      let wantedBy = [];
      let offeredBy = [];
      for (const key in collections) {
        if (collections[key][cardId]?.want > 0) {
          wantedBy.push(key + ' (' + collections[key][cardId].want + ')');
        }
        if (collections[key][cardId]?.offer > 0) {
          offeredBy.push(key + ' (' + collections[key][cardId].offer + ')');
        }
      }
      fullCard.parentNode.innerHTML += '<p>Wanted by: ' + (wantedBy.length > 0 ? wantedBy.join(', ') : '-') + '</p>'
        +'<p>Offered by: ' + (offeredBy.length > 0 ? offeredBy.join(', ') : '-') + '</p>';
    }
  }
  const createCollectionEditInputs = (collection) => {
    // checklist view
    const tables = document.querySelectorAll('table.rwd-table');
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const header = table.querySelector('thead>tr');
      header.innerHTML = '<th>Have/Want/Offer</th>' + header.innerHTML;
      
      const rows = document.querySelectorAll('tbody>tr');
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        const cardId = row.querySelector('a').href.substr(-5);
        row.innerHTML = '<td>'
          +'<input value="' + (collection[cardId]?.have || 0) + '" data-cardId="' + cardId + '" data-valueType="have" class="form-control collection">'
          +'<input value="' + (collection[cardId]?.want || 0) + '" data-cardId="' + cardId + '" data-valueType="want" class="form-control collection">'
          +'<input value="' + (collection[cardId]?.offer || 0) + '" data-cardId="' + cardId + '" data-valueType="offer" class="form-control collection">'
          +'</td>' + row.innerHTML;
        
      }
    }
    // full card view
    const fullCards = document.querySelectorAll('.panel[class*=" border-"]');
    for (let i = 0; i < fullCards.length; i++) {
      const fullCard = fullCards[i];
      const cardId = fullCard.querySelector('a').href.substr(-5);
      fullCard.parentNode.innerHTML += '<p>Have/Want/Offer: '
        +'<input value="' + (collection[cardId]?.have || 0) + '" data-cardId="' + cardId + '" data-valueType="have" class="form-control collection">'
        +'<input value="' + (collection[cardId]?.want || 0) + '" data-cardId="' + cardId + '" data-valueType="want" class="form-control collection">'
        +'<input value="' + (collection[cardId]?.offer || 0) + '" data-cardId="' + cardId + '" data-valueType="offer" class="form-control collection">'
        +'</p>';
    }
  }

  // start of business logic
  await loadStylesheet('/collection/addon.css');
  const collections = await getCollections();
  createCollectionInfos(collections);

  // if logged in, set up collection edit inputs
  const user = await getUser();
  if (user.length <= 0) {
    return Promise.reject('not logged in');
  }
  const myCollection = collections[user] || {};
  createCollectionEditInputs(myCollection);

  // modify options menu in deck builder, add "Show only cards in my collection" as an option
  const cfgOptions = document.getElementById('config-options');
  if (cfgOptions) {
    cfgOptions.innerHTML = '<li><a href="#"><label><input type="checkbox" name="show-only-in-collection"> Show only cards in my collection</label></a></li>' + cfgOptions.innerHTML;
    cfgOptions.addEventListener('change', e => {
      if (e.target.name == 'show-only-in-collection') {
        document.body.setAttribute('data-only-show-cards-in-collection', e.target.checked);
      }
    })
  }

  // listener for collection changes
  document.body.addEventListener('change', e => {
    const cardId = e.target.getAttribute('data-cardId');
    const valueType = e.target.getAttribute('data-valueType');
    const value = parseInt(e.target.value);
    if (!cardId || isNaN(value)) {
      return;
    }
    if (!myCollection[cardId]) {
      myCollection[cardId] = {};
    }
    myCollection[cardId][valueType] = value;
    fetch('/collection/data/app.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=write&data=' + encodeURIComponent(JSON.stringify(myCollection))
    });
    e.target.setAttribute('value', value);
  });

  // observe dom changes for deck builder
  const collectionEl = document.getElementById('collection');
  if (collectionEl) {
    const observer = new MutationObserver((mutationsList, observer) => {
      // mark labels with available quantities
      const inputs = document.querySelectorAll('label.btn>input[name^="qty-"]');
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const cardId = input.getAttribute('name').substr(4);
        input.parentNode.setAttribute('data-inCollection', input.value <= (myCollection[cardId]?.have || 0));
      }
      // mark all rows if in collection or not
      const cardRows = document.querySelectorAll('.collection>tr');
      for (let i = 0; i < cardRows.length; i++) {
        const cardRow = cardRows[i];
        const cardId = cardRow.querySelector('[data-code]').getAttribute('data-code');
        cardRow.setAttribute('data-is-in-collection', (myCollection[cardId]?.have || 0) > 0);
      }
    });
    observer.observe(collectionEl, { subtree: true, childList: true });
    // trigger initial dom mutation
    collectionEl.appendChild(document.createElement('div'));
  }

  // in public profile, show collection
  if (location.pathname.indexOf('/user/profile/') == 0) {
    const profileOf = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);
    if (!collections[profileOf]) {
      return;
    }
    const cardIds = [];
    for (const key in collections[profileOf]) {
      if ((collections[profileOf][key]?.have || 0) > 0 || (collections[profileOf][key]?.want || 0) > 0 || (collections[profileOf][key]?.offer || 0) > 0) {
        cardIds.push(key);
      }
    }
    const resp = await fetch('https://ccgdb.uber.space/find?sort=faction&view=list&q=' + cardIds.join('%7C'));
    const cardHtml = await resp.text();
    const containerEl = document.createElement('div');
    containerEl.innerHTML = cardHtml.replace(/.*(<table class="rwd-table table table-striped table-condensed">.*?<\/table>).*/gsm, '<h2>Collection</h2>$1');
    console.log(containerEl.innerHTML);
    document.querySelector('.main').appendChild(containerEl);
    containerEl.querySelector('thead>tr').innerHTML = '<th>Have/Want/Offer</th>' + containerEl.querySelector('thead>tr').innerHTML;
    const cardRows = containerEl.querySelectorAll('tbody tr');
    for (let i = 0; i < cardRows.length; i++) {
      const cardRow = cardRows[i];
      const cardId = cardRow.querySelector('td[data-th="Name"] a[data-code]').getAttribute('data-code');
      cardRow.innerHTML = '<td>'
        +'<input value="' + (collections[profileOf][cardId]?.have || 0) + '" readonly class="form-control collection">'
        +'<input value="' + (collections[profileOf][cardId]?.want || 0) + '" readonly class="form-control collection">'
        +'<input value="' + (collections[profileOf][cardId]?.offer || 0) + '" readonly class="form-control collection">'
        +'</td>' + cardRow.innerHTML;
    }
  }
});