/* NaijaCare Lite – main logic */
const state = {
  tips: [],
  facilities: [],
  filters: {
    category: 'All',
    audience: 'All',
    q: ''
  },
  map: null,
  markers: [],
  userLatLng: null
};

const el = {
  tipsGrid: document.getElementById('tipsGrid'),
  resultsMeta: document.getElementById('resultsMeta'),
  empty: document.getElementById('emptyState'),
  search: document.getElementById('searchInput'),
  catTabs: document.getElementById('catTabs'),
  offlineBanner: document.getElementById('offlineBanner'),
  facilityList: document.getElementById('facilityList'),
  mapView: document.getElementById('mapView'),
  tipsView: document.getElementById('tipsView'),
  navBtns: document.querySelectorAll('.nav-btn'),
  locateBtn: document.getElementById('locateBtn'),
  nearestInfo: document.getElementById('nearestInfo')
};

function showOfflineBanner(flag) {
  el.offlineBanner.classList.toggle('hidden', !flag);
}

window.addEventListener('online', () => showOfflineBanner(false));
window.addEventListener('offline', () => showOfflineBanner(true));

/* Navigation (Tips / Facilities) */
el.navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active','bg-primary-600','text-white'));
    btn.classList.add('active','bg-primary-600','text-white');
    const view = btn.dataset.view;
    el.tipsView.classList.toggle('hidden', view !== 'tips');
    el.mapView.classList.toggle('hidden', view !== 'map');
    if (view === 'map' && !state.map) initMap();
    if (view === 'map') setTimeout(() => state.map && state.map.invalidateSize(), 50);
  });
});

/* Load data */
async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

async function boot() {
  try {
    [state.tips, state.facilities] = await Promise.all([
      loadJSON('./tips.json'),
      loadJSON('./facilities.json')
    ]);
    buildCategoryTabs();
    renderTips();
    buildFacilityList();
  } catch (e) {
    console.error(e);
    el.tipsGrid.innerHTML = `<div class="col-span-full text-sm text-red-600">Failed to load data.</div>`;
  }

  // Default filters
  selectAudience('All');
  selectCategory('All');

  // Offline state
  if (!navigator.onLine) showOfflineBanner(true);
}
boot();

/* Search & Filters */
el.search.addEventListener('input', (e) => {
  state.filters.q = e.target.value.trim().toLowerCase();
  renderTips();
});

document.querySelectorAll('.aud-btn').forEach(b => {
  b.addEventListener('click', () => selectAudience(b.dataset.audience));
});

function selectAudience(aud) {
  state.filters.audience = aud;
  document.querySelectorAll('.aud-btn').forEach(b => {
    b.classList.toggle('bg-primary-600', b.dataset.audience === aud);
    b.classList.toggle('text-white', b.dataset.audience === aud);
    b.classList.toggle('bg-slate-100', b.dataset.audience !== aud);
  });
  renderTips();
}

function buildCategoryTabs() {
  const cats = ['All', ...Array.from(new Set(state.tips.map(t => t.category)))];
  el.catTabs.innerHTML = cats.map(c => `
    <button class="cat-btn px-3 py-2 rounded-full border border-slate-200 text-sm hover:bg-slate-50"
            data-cat="${c}">
      ${iconForCat(c)} <span class="ml-1">${c}</span>
    </button>
  `).join('');
  el.catTabs.querySelectorAll('.cat-btn').forEach(b => b.addEventListener('click', () => selectCategory(b.dataset.cat)));
}

function selectCategory(cat) {
  state.filters.category = cat;
  el.catTabs.querySelectorAll('.cat-btn').forEach(b => {
    const active = b.dataset.cat === cat;
    b.classList.toggle('bg-primary-600', active);
    b.classList.toggle('text-white', active);
    b.classList.toggle('border-slate-200', !active);
    b.classList.toggle('border-transparent', active);
  });
  renderTips();
}

function iconForCat(cat) {
  const map = {
    'All': '✨',
    'Malaria': '💊',
    'Cholera': '🚰',
    'Menstrual Hygiene': '🩸',
    'Child Care': '👶',
    'COVID-19': '🤒'
  };
  return map[cat] || '💡';
}

function renderTips() {
  let list = state.tips.slice();

  // category filter
  if (state.filters.category !== 'All') {
    list = list.filter(t => t.category === state.filters.category);
  }
  // audience filter
  if (state.filters.audience !== 'All') {
    list = list.filter(t => t.audience.includes(state.filters.audience));
  }
  // search
  if (state.filters.q) {
    const q = state.filters.q;
    list = list.filter(t =>
      t.text.toLowerCase().includes(q) ||
      t.keywords.join(' ').toLowerCase().includes(q)
    );
  }

  el.resultsMeta.textContent =
    `${list.length} tip${list.length !== 1 ? 's' : ''} • Category: ${state.filters.category} • Audience: ${state.filters.audience}`;

  el.tipsGrid.innerHTML = list.map(tipCard).join('');
  el.empty.classList.toggle('hidden', list.length > 0);

  // Attach share handlers
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', () => shareTip(JSON.parse(btn.dataset.share)));
  });
}

function tipCard(t) {
  const audiences = t.audience.map(a => `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">${a}</span>`).join(' ');
  const srcLink = t.source ? `<a class="text-xs text-primary-700 hover:underline" href="${t.source}" target="_blank" rel="noopener">Source</a>` : '';
  return `
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft hover:translate-y-[-2px] transition">
      <div class="flex items-start gap-3">
        <div class="text-2xl">${iconForCat(t.category)}</div>
        <div class="flex-1">
          <h3 class="font-semibold">${t.category}</h3>
          <p class="mt-1 text-sm leading-relaxed">${t.text}</p>
          <div class="mt-3 flex items-center justify-between">
            <div class="flex gap-1">${audiences}</div>
            <div class="flex items-center gap-3">
              ${srcLink}
              <button class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm"
                      data-share='${JSON.stringify({ text: t.text })}'>📤 Share</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function shareTip({ text }) {
  const msg = `${text} — via NaijaCare Lite`;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(wa, '_blank');
}

/* Map + Facilities */
function initMap() {
  state.map = L.map('map').setView([9.0820, 8.6753], 6); // Nigeria center
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);

  // markers
  state.markers = state.facilities.map(f => {
    const marker = L.marker([f.lat, f.lng]).addTo(state.map);
    marker.bindPopup(`
      <div class="font-semibold">${f.name}</div>
      <div class="text-xs">${f.address}</div>
      <div class="mt-1 text-xs">📞 <a href="tel:${f.phone}">${f.phone}</a></div>
      <div class="mt-1">
        <a class="text-xs text-primary-700" target="_blank"
           href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}">
           📍 Directions
        </a>
      </div>
    `);
    return marker;
  });
}

function buildFacilityList() {
  el.facilityList.innerHTML = state.facilities.map(f => `
    <div class="border border-slate-200 rounded-xl p-3">
      <div class="font-semibold">${f.name}</div>
      <div class="text-xs text-slate-600">${f.address}</div>
      <div class="mt-1 flex items-center justify-between">
        <a class="text-xs text-primary-700" target="_blank"
           href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}">Get directions</a>
        <a class="text-xs" href="tel:${f.phone}">📞 Call</a>
      </div>
    </div>
  `).join('');
}

el.locateBtn.addEventListener('click', async () => {
  if (!state.map) initMap();
  if (!navigator.geolocation) {
    el.nearestInfo.textContent = 'Geolocation not supported on this device.';
    return;
  }
  el.nearestInfo.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    state.userLatLng = [latitude, longitude];
    const userMarker = L.circleMarker(state.userLatLng, { radius: 8, color: '#10B981' }).addTo(state.map);
    userMarker.bindPopup('You are here').openPopup();
    state.map.setView(state.userLatLng, 12);

    // compute nearest
    const nearest = state.facilities
      .map(f => ({ ...f, d: haversine(latitude, longitude, f.lat, f.lng) }))
      .sort((a, b) => a.d - b.d)[0];

    el.nearestInfo.innerHTML = `
      Nearest: <strong>${nearest.name}</strong> • ${nearest.d.toFixed(1)} km away<br/>
      <a class="text-primary-700" target="_blank"
         href="https://www.google.com/maps/dir/?api=1&destination=${nearest.lat},${nearest.lng}">
         📍 Open directions
      </a>`;
  }, () => {
    el.nearestInfo.textContent = 'Could not get your location. Please allow location access.';
  });
});

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
