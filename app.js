/* Gwinnett County Election Day Precinct Finder */
(function () {
  "use strict";

  const REPO_URL = "https://github.com/Mdr-palacios/gwinnett-precinct-finder";
  document.getElementById("repo-link").href = REPO_URL;

  // State
  let precincts = [];
  let filtered = [];
  let markers = {};
  let map;
  let cluster;
  let userMarker = null;
  let activeId = null;

  const els = {
    list: document.getElementById("precinct-list"),
    search: document.getElementById("search"),
    cityFilter: document.getElementById("city-filter"),
    locateBtn: document.getElementById("locate-btn"),
    stats: document.getElementById("stats"),
    totalCount: document.getElementById("total-count"),
  };

  const pinIcon = L.divIcon({
    className: "",
    html: '<div class="custom-pin"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -22],
  });
  const userIcon = L.divIcon({
    className: "",
    html: '<div class="custom-pin user"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  function initMap() {
    map = L.map("map", { scrollWheelZoom: true }).setView([33.96, -84.02], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
    });
    map.addLayer(cluster);
  }

  function buildPopupHtml(p) {
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      p.full_address
    )}`;
    const apple = `https://maps.apple.com/?daddr=${encodeURIComponent(
      p.full_address
    )}`;
    return `
      <div>
        <p class="popup-title">${escapeHtml(p.location)}</p>
        <div class="popup-meta">Precinct ${escapeHtml(p.precinct)} &middot; ${escapeHtml(p.name)}</div>
        <div>${escapeHtml(p.address)}<br>${escapeHtml(p.city)}, ${escapeHtml(p.state)} ${escapeHtml(p.zip)}</div>
        <div class="popup-actions">
          <a href="${gmaps}" target="_blank" rel="noopener">Google Directions</a>
          <a href="${apple}" target="_blank" rel="noopener">Apple Maps</a>
        </div>
      </div>`;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function addMarkers() {
    precincts.forEach((p) => {
      if (typeof p.lat !== "number" || typeof p.lon !== "number") return;
      const m = L.marker([p.lat, p.lon], { icon: pinIcon });
      m.bindPopup(buildPopupHtml(p));
      m.on("click", () => setActive(p.precinct, false));
      markers[p.precinct] = m;
      cluster.addLayer(m);
    });
  }

  function renderList(items) {
    els.list.innerHTML = "";
    if (!items.length) {
      els.list.innerHTML = '<li style="padding:20px;color:var(--muted);">No precincts match your search.</li>';
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((p) => {
      const li = document.createElement("li");
      li.dataset.id = p.precinct;
      const dist = p.distance != null
        ? `<span class="precinct-distance">${p.distance.toFixed(1)} mi</span>`
        : "";
      li.innerHTML = `
        <div>
          <span class="precinct-num">${escapeHtml(p.precinct)}</span>
          <span class="precinct-name">${escapeHtml(p.name)}</span>
          ${dist}
        </div>
        <div class="precinct-location">${escapeHtml(p.location)}</div>
        <div class="precinct-address">${escapeHtml(p.address)} &middot; ${escapeHtml(p.city)} ${escapeHtml(p.zip)}</div>
      `;
      li.addEventListener("click", () => setActive(p.precinct, true));
      frag.appendChild(li);
    });
    els.list.appendChild(frag);
    if (activeId) highlightActiveItem();
  }

  function highlightActiveItem() {
    [...els.list.querySelectorAll("li")].forEach((li) => {
      li.classList.toggle("active", li.dataset.id === activeId);
    });
    const activeLi = els.list.querySelector("li.active");
    if (activeLi) activeLi.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function setActive(precinctId, panMap) {
    activeId = precinctId;
    const p = precincts.find((x) => x.precinct === precinctId);
    if (!p) return;
    highlightActiveItem();
    const m = markers[precinctId];
    if (m) {
      if (panMap) {
        // Zoom in and ensure cluster opens
        cluster.zoomToShowLayer(m, () => {
          m.openPopup();
        });
      } else {
        m.openPopup();
      }
    }
  }

  function applyFilters() {
    const q = els.search.value.trim().toLowerCase();
    const city = els.cityFilter.value;
    filtered = precincts.filter((p) => {
      if (city && p.city !== city) return false;
      if (!q) return true;
      return [p.precinct, p.name, p.location, p.address, p.city, p.zip]
        .some((v) => String(v).toLowerCase().includes(q));
    });

    // Update map: show only filtered
    cluster.clearLayers();
    filtered.forEach((p) => {
      const m = markers[p.precinct];
      if (m) cluster.addLayer(m);
    });

    renderList(filtered);
    els.stats.textContent =
      filtered.length === precincts.length
        ? `Showing all ${precincts.length} Election Day precincts`
        : `Showing ${filtered.length} of ${precincts.length} precincts`;
  }

  function populateCityFilter() {
    const cities = [...new Set(precincts.map((p) => p.city))].sort();
    cities.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      els.cityFilter.appendChild(opt);
    });
  }

  /* Distance: Haversine in miles */
  function distMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation isn't supported in this browser.");
      return;
    }
    els.locateBtn.disabled = true;
    els.locateBtn.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        precincts.forEach((p) => {
          if (typeof p.lat === "number") {
            p.distance = distMiles(latitude, longitude, p.lat, p.lon);
          }
        });
        // Sort precincts by distance for display
        precincts.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
        applyFilters();

        // User pin
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup("Your location");
        map.setView([latitude, longitude], 12);

        // Highlight nearest
        const nearest = precincts.find((p) => typeof p.lat === "number");
        if (nearest) setActive(nearest.precinct, true);

        els.locateBtn.textContent = "Nearest first ✓";
        els.locateBtn.classList.add("active");
        els.locateBtn.disabled = false;
      },
      (err) => {
        els.locateBtn.disabled = false;
        els.locateBtn.textContent = "Use my location";
        let msg = "Could not get your location.";
        if (err.code === 1) msg = "Location permission denied. Enable it in your browser settings.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function load() {
    try {
      const res = await fetch("precincts.json", { cache: "no-cache" });
      precincts = await res.json();
    } catch (e) {
      els.stats.textContent = "Failed to load precinct data.";
      console.error(e);
      return;
    }
    els.totalCount.textContent = precincts.length;
    initMap();
    addMarkers();
    populateCityFilter();
    applyFilters();

    els.search.addEventListener("input", applyFilters);
    els.cityFilter.addEventListener("change", applyFilters);
    els.locateBtn.addEventListener("click", useMyLocation);

    // Pre-check query string for ?precinct=
    const params = new URLSearchParams(location.search);
    const pre = params.get("precinct");
    if (pre) {
      els.search.value = pre;
      applyFilters();
      setTimeout(() => setActive(pre, true), 300);
    }
  }

  load();
})();
