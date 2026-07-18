const box = document.getElementById('box');

function swapBox(buildFn){
  box.style.opacity = '0';
  box.style.transform = 'translateY(10px)';
  setTimeout(function(){
    buildFn();
    box.style.opacity = '1';
    box.style.transform = 'translateY(0)';
  }, 300);
}

const FIELD_IDS = ['voisins','commerces','dist_olt_armoire','dist_armoire_splitteurs',
  'dist_repartiteur_pel','longueur_interieure','ratio_split','type_olt','marge',
  'prix_metre','nb_connecteurs','nb_epissures'];

function renderFormContent(prefill){
  prefill = prefill || {};
  box.innerHTML =
    '<div class="form-error" id="formError">Merci de remplir tous les champs avant de lancer le calcul.</div>' +
    '<p class="section-label">Immeuble</p>' +

    '<div class="field">' +
      '<label for="voisins">Nombre de voisins dans l\'immeuble</label>' +
      '<input type="number" id="voisins" min="0" step="1" placeholder="Ex : 24">' +
    '</div>' +

    '<div class="field">' +
      '<label for="commerces">Nombre de commerces dans l\'immeuble</label>' +
      '<input type="number" id="commerces" min="0" step="1" placeholder="Ex : 3">' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label blue">Distances du réseau</p>' +

    '<div class="field">' +
      '<label for="dist_olt_armoire">Distance entre l\'OLT et l\'armoire principale</label>' +
      '<div class="unit-input">' +
        '<input type="text" id="dist_olt_armoire" placeholder="Ex : 850">' +
        '<span class="unit">mètres</span>' +
      '</div>' +
    '</div>' +

    '<div class="field">' +
      '<label for="dist_armoire_splitteurs">Distance entre l\'armoire et les splitteurs</label>' +
      '<div class="unit-input">' +
        '<input type="text" id="dist_armoire_splitteurs" placeholder="Ex : 120">' +
        '<span class="unit">mètres</span>' +
      '</div>' +
    '</div>' +

    '<div class="field">' +
      '<label for="dist_repartiteur_pel">Distance entre le répartiteur et le point d\'entrée logement</label>' +
      '<div class="unit-input">' +
        '<input type="text" id="dist_repartiteur_pel" placeholder="Ex : 45">' +
        '<span class="unit">mètres</span>' +
      '</div>' +
    '</div>' +

    '<div class="field">' +
      '<label for="longueur_interieure">Longueur intérieure par logement</label>' +
      '<div class="unit-input">' +
        '<input type="text" id="longueur_interieure" placeholder="Ex : 15">' +
        '<span class="unit">mètres</span>' +
      '</div>' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label">Configuration réseau</p>' +

    '<div class="row2">' +
      '<div class="field">' +
        '<label for="ratio_split">Ratio de split souhaité</label>' +
        '<select id="ratio_split">' +
          '<option value="" disabled selected>Choisir un ratio</option>' +
          '<option value="1:32">1:32</option>' +
          '<option value="1:64">1:64</option>' +
        '</select>' +
      '</div>' +
      '<div class="field">' +
        '<label for="type_olt">Type d\'OLT</label>' +
        '<select id="type_olt">' +
          '<option value="" disabled selected>Choisir un type</option>' +
          '<option value="fixe">Fixe</option>' +
          '<option value="modulaire">Modulaire</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    '<div class="field">' +
      '<label for="marge">Marge (%)</label>' +
      '<span class="hint" style="margin-bottom:6px;">Marge de sécurité à appliquer au budget optique.</span>' +
      '<input type="text" id="marge" placeholder="Ex : 10">' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label blue">Coûts &amp; budget optique</p>' +

    '<div class="field">' +
      '<label for="prix_metre">Prix au mètre du câble</label>' +
      '<div class="unit-input">' +
        '<input type="text" id="prix_metre" placeholder="Ex : 1.2">' +
        '<span class="unit">DT/m</span>' +
      '</div>' +
    '</div>' +

    '<div class="row2">' +
      '<div class="field">' +
        '<label for="nb_connecteurs">Nombre de connecteurs</label>' +
        '<input type="text" id="nb_connecteurs" placeholder="Ex : 4">' +
      '</div>' +
      '<div class="field">' +
        '<label for="nb_epissures">Nombre d\'épissures</label>' +
        '<input type="text" id="nb_epissures" placeholder="Ex : 2">' +
      '</div>' +
    '</div>' +

    '<button type="button" class="primary" id="submitBtn">Calculer le dimensionnement</button>';

  FIELD_IDS.forEach(function(id){
    if(prefill[id] !== undefined){
      document.getElementById(id).value = prefill[id];
    }
  });

  FIELD_IDS.forEach(function(id){
    const el = document.getElementById(id);
    el.addEventListener('input', function(){ el.classList.remove('invalid'); });
    el.addEventListener('change', function(){ el.classList.remove('invalid'); });
  });

  document.getElementById('submitBtn').addEventListener('click', handleSubmit);
}

function handleSubmit(){
  let firstInvalid = null;
  const data = {};

  FIELD_IDS.forEach(function(id){
    const el = document.getElementById(id);
    const val = el.value.trim();
    const empty = val === '';
    el.classList.toggle('invalid', empty);
    if(empty && !firstInvalid) firstInvalid = el;
    data[id] = val;
  });

  if(firstInvalid){
    document.getElementById('formError').classList.add('show');
    firstInvalid.classList.add('shake');
    firstInvalid.focus();
    setTimeout(function(){ firstInvalid.classList.remove('shake'); }, 400);
    return;
  }

  swapBox(function(){ renderLoadingContent(); });

  setTimeout(function(){
    swapBox(function(){ renderResultContent(data); });
  }, 2200);
}

function renderLoadingContent(){
  box.innerHTML =
    '<div class="loading-box">' +
      '<div class="spinner-wrap"><div class="spinner-ring"></div></div>' +
      '<h2>Calcul en cours</h2>' +
      '<p>Analyse des distances et du budget optique du réseau.</p>' +
      '<div class="progress-track"><div class="progress-fill"></div></div>' +
      '<div class="send-track"><span class="send-icon">&#8594;</span></div>' +
    '</div>';
}

function renderResultContent(data){
  const voisins = parseFloat(data.voisins) || 0;
  const commerces = parseFloat(data.commerces) || 0;
  const totalPersonnes = voisins + commerces;

  const ratioValue = parseFloat((data.ratio_split.split(':')[1] || '0')) || 1;
  const nbPON = Math.ceil(totalPersonnes / ratioValue);
  const nbSplitteurs = nbPON;
  const nbONT = voisins;
  const nbONU = commerces;

  const d1 = parseFloat(data.dist_olt_armoire) || 0;
  const d2 = parseFloat(data.dist_armoire_splitteurs) || 0;
  const d3 = parseFloat(data.dist_repartiteur_pel) || 0;
  const d4 = parseFloat(data.longueur_interieure) || 0;
  const totalDistanceM = d1 + d2 + d3 + d4;
  const distanceMaxKm = totalDistanceM / 1000;

  const prixMetre = parseFloat(data.prix_metre) || 0;
  const coutTotalCables = totalDistanceM * prixMetre;

  const nbConnecteurs = parseFloat(data.nb_connecteurs) || 0;
  const nbEpissures = parseFloat(data.nb_epissures) || 0;
  const pertesSplitter = 17;
  const attenuationTotale = (distanceMaxKm * 0.35) + pertesSplitter + (nbConnecteurs * 0.3) + (nbEpissures * 0.05);

  function fmt(n){
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  }

  box.innerHTML =
    '<span class="result-badge"><span class="dot"></span>Résultat du dimensionnement</span>' +

    '<p class="section-label">Effectif</p>' +
    '<div class="result-card" style="margin-bottom:12px;">' +
      '<span class="k">Total de personnes desservies</span>' +
      '<span class="v" style="font-size:24px;">' + fmt(totalPersonnes) + '</span>' +
    '</div>' +
    '<div class="result-grid">' +
      '<div class="result-card"><span class="k">Voisins</span><span class="v">' + fmt(voisins) + '</span></div>' +
      '<div class="result-card"><span class="k">Commerces</span><span class="v">' + fmt(commerces) + '</span></div>' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label blue">Équipements réseau</p>' +
    '<div class="result-grid">' +
      '<div class="result-card"><span class="k">Nombre de ports PON nécessaires</span><span class="v orange">' + fmt(nbPON) + '</span></div>' +
      '<div class="result-card"><span class="k">Nombre de splitteurs</span><span class="v orange">' + fmt(nbSplitteurs) + '</span></div>' +
      '<div class="result-card"><span class="k">Nombre d\'ONT</span><span class="v">' + fmt(nbONT) + '</span></div>' +
      '<div class="result-card"><span class="k">Nombre d\'ONU</span><span class="v">' + fmt(nbONU) + '</span></div>' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label">Distances du réseau</p>' +
    '<div class="result-grid">' +
      '<div class="result-card"><span class="k">OLT &#8594; armoire</span><span class="v">' + fmt(d1) + ' m</span></div>' +
      '<div class="result-card"><span class="k">Armoire &#8594; splitteurs</span><span class="v">' + fmt(d2) + ' m</span></div>' +
      '<div class="result-card"><span class="k">Répartiteur &#8594; PEL</span><span class="v">' + fmt(d3) + ' m</span></div>' +
      '<div class="result-card"><span class="k">Longueur intérieure</span><span class="v">' + fmt(d4) + ' m</span></div>' +
      '<div class="result-card"><span class="k">Ratio de split</span><span class="v">' + data.ratio_split + '</span></div>' +
      '<div class="result-card"><span class="k">Type d\'OLT</span><span class="v">' + (data.type_olt === 'fixe' ? 'Fixe' : 'Modulaire') + '</span></div>' +
    '</div>' +

    '<div class="divider-gap"></div>' +
    '<p class="section-label blue">Coûts &amp; budget optique</p>' +
    '<div class="result-card" style="margin-bottom:12px;">' +
      '<span class="k">Coût total câbles</span>' +
      '<span class="v orange" style="font-size:22px;">' + fmt(coutTotalCables) + ' DT</span>' +
      '<span class="formula">Coût total câbles = &Sigma; (Longueur du segment &times; Prix au mètre)</span>' +
      '<span class="hint">' + fmt(totalDistanceM) + ' m &times; ' + fmt(prixMetre) + ' DT/m = ' + fmt(coutTotalCables) + ' DT</span>' +
    '</div>' +
    '<div class="result-card" style="margin-bottom:12px;">' +
      '<span class="k">Bilan optique (atténuation totale)</span>' +
      '<span class="v orange" style="font-size:22px;">' + fmt(attenuationTotale) + ' dB</span>' +
      '<span class="formula">Atténuation totale = (Distance max &times; 0.35 dB/km) + Pertes splitter + (Nb connecteurs &times; 0.3 dB) + (Nb épissures &times; 0.05 dB)</span>' +
      '<span class="hint">(' + fmt(distanceMaxKm) + ' km &times; 0.35) + 17 dB + (' + fmt(nbConnecteurs) + ' &times; 0.3) + (' + fmt(nbEpissures) + ' &times; 0.05) = ' + fmt(attenuationTotale) + ' dB</span>' +
    '</div>' +
    '<div class="result-card" style="grid-column:1 / -1;"><span class="k">Marge appliquée</span><span class="v">' + data.marge + ' %</span></div>' +

    '<div class="divider-gap"></div>' +
    '<button type="button" class="secondary" id="backBtn">&#8592; Revenir au formulaire</button>';

  document.getElementById('backBtn').addEventListener('click', function(){
    swapBox(function(){ renderFormContent(data); });
  });
}

renderFormContent();