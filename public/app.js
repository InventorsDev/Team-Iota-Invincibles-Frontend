document.addEventListener("DOMContentLoaded", () => {
  // --- DATA ---
  let healthTips = [];

fetch("tips.json")
  .then((res) => res.json())
  .then((data) => {
    healthTips = data;
    renderContent();
    renderBottomNav();
  })
  .catch((err) => {
    console.error("Failed to load tips:", err);
  });


  const icons = {
    HomeIcon: `<svg class="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
    ShieldCheckIcon: `<svg class="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`,
    WomanIcon: `<svg class="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`,
    UserGroupIcon: `<svg class="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
    MapIcon: `<svg class="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 0l6-3m0 0l-6-4-6 4m12 0v10" /></svg>`,
  };

  const navItems = [
    { label: "Malaria", icon: icons.HomeIcon },
    { label: "Cholera", icon: icons.ShieldCheckIcon },
    { label: "Menstrual Hygiene", icon: icons.WomanIcon },
    { label: "Child Health", icon: icons.UserGroupIcon },
    { label: "Map", icon: icons.MapIcon },
  ];

  // --- STATE ---
  let activeTab = navItems[0].label;
  let searchTerm = "";

  // --- DOM ELEMENTS ---
  const landingScreen = document.getElementById("landing-screen");
  const mainApp = document.getElementById("main-app");
  const startBtn = document.getElementById("start-browsing-btn");
  const offlineBanner = document.getElementById("offline-banner");
  const mainContent = document.getElementById("main-content");
  const bottomNav = document.getElementById("bottom-nav");

  // --- RENDER FUNCTIONS ---
  const renderTipsScreen = () => {
    const filteredTips = healthTips
      .filter((tip) => tip.category === activeTab)
      .filter(
        (tip) =>
          tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tip.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const tipCardsHtml =
      filteredTips.length > 0
        ? filteredTips
            .map(
              (tip) => `
            <div class="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                <div class="flex items-start">
                    <span class="text-2xl mr-4">${tip.icon}</span>
                    <div>
                        <h3 class="font-bold text-gray-800">${tip.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${tip.description}</p>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <button data-title="${tip.title}" data-description="${tip.description}" class="share-btn flex items-center px-3 py-1 bg-naija-blue text-white text-xs font-bold rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50">
                        <svg class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.13c-1.55 0-3.05-.44-4.33-1.25l-.31-.18-3.22.84.86-3.14-.2-.32a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24s8.24 3.7 8.24 8.24-3.7 8.24-8.24 8.24zm4.52-6.2c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.96-.15.17-.3.19-.56.06-.26-.12-1.09-.4-2.08-1.28-.77-.69-1.29-1.54-1.44-1.8-.15-.27-.02-.42.11-.54.11-.11.25-.27.37-.4.13-.12.17-.21.25-.33.08-.13.04-.25-.02-.37-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.48c-.15 0-.39.04-.6.19-.2.15-.79.76-.79 1.85s.81 2.15.92 2.31c.12.17 1.58 2.41 3.83 3.39.54.23.96.36 1.29.47.69.21 1.32.18 1.82.11.56-.06 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.31z" /></svg>
                        Share
                    </button>
                </div>
            </div>
        `
            )
            .join("")
        : `<p class="text-center text-gray-500 mt-8">No tips found for "${searchTerm}" in ${activeTab}.</p>`;

    mainContent.innerHTML = `
            <div class="p-4">
                <header class="flex items-center justify-between mb-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">NaijaCare Lite</h1>
                        <p class="text-sm text-gray-500">Your pocket health guide</p>
                    </div>
                    <svg class="h-10 w-10" viewBox="0 0 100 100"><defs><linearGradient id="leafGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#22c55e;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#16a34a;stop-opacity:1"></stop></linearGradient></defs><path d="M42,20 H58 V42 H80 V58 H58 V80 H42 V58 H20 V42 H42Z" class="fill-gray-300"></path><path d="M60,20 C80,20 90,40 70,60 C50,80 50,60 60,40 C65,30 60,20 60,20Z" fill="url(#leafGradientHeader)" transform="rotate(45 50 50)"></path></svg>
                </header>
                <h2 class="text-xl font-bold text-gray-700 mt-6 mb-4">${activeTab} Tips</h2>
                <div class="space-y-4">${tipCardsHtml}</div>
            </div>
        `;
    document
      .getElementById("search-bar")
      .addEventListener("input", handleSearch);
  };

  const renderMapScreen = () => {
    // Facilities with coordinates
    let healthFacilities = [
      {
        name: "General Hospital, Gbagada",
        address: "Gbagada Expy, Lagos",
        phone: "08012345678",
        lat: 6.565,
        lng: 3.386,
      },
      {
        name: "Lagos University Teaching Hospital (LUTH)",
        address: "Idi-Araba, Lagos",
        phone: "08087654321",
        lat: 6.503,
        lng: 3.361,
      },
      {
        name: "St. Nicholas Hospital",
        address: "57 Campbell St, Lagos Island",
        phone: "08011223344",
        lat: 6.451,
        lng: 3.406,
      },
      {
        name: "Asokoro General Hospital",
        address: "Asokoro, Abuja",
        phone: "09012345678",
        lat: 9.034,
        lng: 7.515,
      },
    ];

    // Function to render facility list HTML
    const buildFacilitiesList = (facilities) =>
      facilities
        .map(
          (facility) => `
    <li class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-start">
            <svg class="h-5 w-5 text-naija-red mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-6.05a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
            <div>
                <p class="font-bold text-gray-900">${facility.name}</p>
                <p class="text-xs text-gray-500">${facility.address}</p>
                ${
                  facility.dist !== undefined
                    ? `<p class="text-xs text-naija-green font-semibold mt-1">📍 ${facility.dist.toFixed(
                        1
                      )} km away</p>`
                    : ""
                }
            </div>
        </div>
        <a href="tel:${facility.phone}" aria-label="Call ${
            facility.name
          }" class="ml-2 flex-shrink-0 p-2 bg-naija-green text-white rounded-full hover:bg-green-700">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
        </a>
      </div>
    </li>
`
        )
        .join("");

    mainContent.innerHTML = `
        <div class="flex flex-col h-full">
            <header class="p-4"><h1 class="text-xl font-bold text-gray-800 text-center">Find Nearby Health Centers</h1></header>
            <div id="map" class="relative h-64 rounded-lg shadow-sm border border-gray-200"></div>
            <div class="p-4 flex-grow">
                <button id="locateMeBtn" class="mb-3 px-3 py-2 bg-naija-green text-white rounded-md hover:bg-green-700">📍 Use My Location</button>
                <h2 class="text-lg font-semibold text-gray-700 mb-3">Facilities Near You:</h2>
                <ul id="facilitiesList" class="space-y-3">${buildFacilitiesList(
                  healthFacilities
                )}</ul>
            </div>
        </div>
    `;

    // Initialize Leaflet Map
    const map = L.map("map").setView([9.082, 8.6753], 6); // Nigeria center
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Facility markers
    let markers = [];
    const renderMarkers = (facilities) => {
      markers.forEach((m) => map.removeLayer(m));
      markers = facilities.map((f) => {
        const m = L.marker([f.lat, f.lng])
          .addTo(map)
          .bindPopup(
            `<b>${f.name}</b><br>${f.address}<br>📞 <a href="tel:${f.phone}">${f.phone}</a>`
          );
        return m;
      });
    };
    renderMarkers(healthFacilities);

    // "Use My Location" button
    // "Use My Location" button
    document.getElementById("locateMeBtn").addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            // Show user marker
            const userMarker = L.marker([latitude, longitude]).addTo(map);
            userMarker.bindPopup("📍 You are here").openPopup();
            map.setView([latitude, longitude], 12);

            // Compute nearby facilities within 50 km
            const nearbyFacilities = healthFacilities
              .map((f) => ({
                ...f,
                dist: haversine(latitude, longitude, f.lat, f.lng),
              }))
              .filter((f) => f.dist <= 50)
              .sort((a, b) => a.dist - b.dist);

            if (nearbyFacilities.length === 0) {
              document.getElementById(
                "facilitiesList"
              ).innerHTML = `<p class="text-gray-500">No health facilities found near your location.</p>`;
              return;
            }

            // Override facility list with only nearby facilities + distances
            document.getElementById("facilitiesList").innerHTML =
              buildFacilitiesList(nearbyFacilities);
            renderMarkers(nearbyFacilities);
          },
          () => alert("Unable to retrieve location.")
        );
      } else {
        alert("Geolocation not supported.");
      }
    });
  };

  // Haversine distance helper (km)
  function haversine(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  //Removed the search bar in maps

  const searchContainer = document.getElementById('searchContainer');

  const renderBottomNav = () => {
    bottomNav.innerHTML = navItems
      .map((item) => {
        const isActive = activeTab === item.label;
        const activeClass = "text-naija-green";
        const inactiveClass = "text-gray-500 hover:text-naija-green";
        return `
                <button data-label="${
                  item.label
                }" class="nav-btn flex flex-col items-center justify-center w-full h-full text-xs font-medium focus:outline-none transition-colors duration-200 ${
          isActive ? activeClass : inactiveClass
        }" aria-label="Go to ${item.label} section" ${
          isActive ? 'aria-current="page"' : ""
        } style="min-width: 44px; min-height: 44px;">
                    ${item.icon}
                    <span>${
                      item.label === "Map" ? "Locator" : item.label
                    }</span>
                </button>
            `;
      })
      .join("");
    document
      .querySelectorAll(".nav-btn")
      .forEach((btn) => btn.addEventListener("click", handleNavClick));
  };

  const renderContent = () => {
    if (activeTab === "Map") {
      renderMapScreen();
      searchContainer.remove()
    } else {
      renderTipsScreen();
    }
  };

  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      offlineBanner.classList.add("hidden");
    } else {
      offlineBanner.classList.remove("hidden");
    }
  };

  // --- EVENT HANDLERS ---
  const handleNavClick = (event) => {
    const label = event.currentTarget.dataset.label;
    if (activeTab !== label) {
      activeTab = label;
      searchTerm = ""; // Reset search on tab change
      renderContent();
      renderBottomNav();
    }
  };

  const handleSearch = (event) => {
    searchTerm = event.target.value;
    renderTipsScreen();
  };

  const handleShare = (event) => {
    const button = event.target.closest(".share-btn");
    if (button) {
      const title = button.dataset.title;
      const description = button.dataset.description;
      const message = encodeURIComponent(
        `*NaijaCare Tip: ${title}*\n\n${description}`
      );
      window.open(`https://wa.me/?text=${message}`, "_blank");
    }
  };

  // --- INITIALIZATION ---
  startBtn.addEventListener("click", () => {
    landingScreen.classList.remove("active");
    mainApp.classList.add("active");
    renderContent();
    renderBottomNav();
  });

  mainContent.addEventListener("click", handleShare);
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // Initial check
  updateOnlineStatus();
});

const chatIcon = document.getElementById("chatIcon");
  const chatWindow = document.getElementById("chatWindow");

  // Toggle chat window when icon is clicked
  chatIcon.addEventListener("click", () => {
    chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
  });

  // Send message to backend
  async function sendMessage() {
    const input = document.getElementById("userInput").value;
    if (!input) return;

    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML += `<div><b>You:</b> ${input}</div>`;

    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    chatbox.innerHTML += `<div><b>Bot:</b> ${data.reply}</div>`;

    document.getElementById("userInput").value = "";
    chatbox.scrollTop = chatbox.scrollHeight; // auto-scroll
  }