// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Travel Planner Pro - Sistema Listo.");
    initApp();
    setupEventListeners();
});

function initApp() {
    const savedUser = localStorage.getItem('user_name');
    const welcomeTextEl = document.getElementById('welcome-text');
    const registroSeccion = document.getElementById('registro-seccion');

    if (savedUser) {
        if (welcomeTextEl) welcomeTextEl.textContent = `Bienvenido, ${savedUser} 👋`;
        if (registroSeccion) registroSeccion.style.display = 'none';
    } else {
        if (welcomeTextEl) welcomeTextEl.textContent = 'Bienvenido, Viajero 👋';
    }

    const savedTheme = localStorage.getItem('tp_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }

    updateDashboardCounters();
}

function setupEventListeners() {
    const registerForm = document.getElementById('register-form');
    const buscarBtn = document.getElementById('btn-buscar');
    const themeToggle = document.getElementById('theme-toggle');

    // CORRECCIÓN REGISTRO: Asegurar captura correcta de los inputs
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Buscamos los inputs por su ID corporativo
            const nameInput = document.getElementById('reg-name') || registerForm.querySelector('input[type="text"]');
            const emailInput = document.getElementById('reg-email') || registerForm.querySelector('input[type="email"]');

            if (nameInput && nameInput.value.trim()) {
                const userName = nameInput.value.trim();
                
                localStorage.setItem('user_name', userName);
                if (emailInput) {
                    localStorage.setItem('user_email', emailInput.value.trim());
                }

                const welcomeTextEl = document.getElementById('welcome-text');
                if (welcomeTextEl) welcomeTextEl.textContent = `Bienvenido, ${userName} 👋`;

                const registroSeccion = document.getElementById('registro-seccion');
                if (registroSeccion) registroSeccion.style.display = 'none';

                alert(`¡Registro exitoso! Bienvenido, ${userName}.`);
                updateDashboardCounters();
            } else {
                alert("Por favor, introduce tu nombre para continuar.");
            }
        });
    }

    if (buscarBtn) {
        buscarBtn.addEventListener('click', handleSearch);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('tp_theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
        });
    }
}

async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput || !searchInput.value.trim()) {
        alert("Por favor, escribe el nombre de un país.");
        return;
    }

    const countryName = searchInput.value.trim();
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    
    if (loader) loader.style.display = 'block';
    if (resultsContainer) resultsContainer.style.display = 'none';

    try {
        // Llamada a GeoAPI (en countries.js)
        const countryData = await fetchCountryData(countryName);
        
        if (!countryData) {
            alert("No se pudieron obtener los datos del destino.");
            if (loader) loader.style.display = 'none';
            return; 
        }

        saveToHistory(countryData.name);

        // Renderizados seguros con bloques try/catch individuales
        try { renderCountryCard(countryData); } catch (e) { console.error("Error tarjeta país:", e); }
        
        try {
            if (typeof fetchWeatherData === 'function') {
                const weather = await fetchWeatherData(countryData.latlng[0], countryData.latlng[1]);
                if (weather) renderWeatherCard(weather, countryData.capital);
            }
        } catch (e) { console.error("Error clima:", e); }

        // CONTROL DE SEGURIDAD DIVISAS: Si viene indefinido de la API, fuerza COP o USD
        try {
            if (typeof renderCurrencyModule === 'function') {
                const finalCurrency = countryData.currencyCode && countryData.currencyCode !== "Consultando..." ? countryData.currencyCode : "COP";
                await renderCurrencyModule(finalCurrency);
            }
        } catch (e) { console.error("Error divisas:", e); }

        try {
            if (typeof renderTourismModule === 'function') {
                await renderTourismModule(countryData.name);
            }
        } catch (e) { console.error("Error turismo:", e); }

        // Mostrar resultados pase lo que pase
        if (resultsContainer) {
            resultsContainer.style.display = 'grid';
            // Forzar visibilidad por si el CSS tiene un display bloqueado
            resultsContainer.style.setProperty('display', 'grid', 'important');
        }

    } catch (error) {
        console.error("Error crítico en búsqueda:", error);
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function renderCountryCard(data) {
    const container = document.getElementById('country-info');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <img src="${data.flag}" alt="Bandera" style="width:100%; max-width:240px; border-radius:4px; box-shadow: 0px 4px 8px var(--shadow);">
        </div>
        <h3 style="font-size: 1.6rem; margin-bottom: 12px; text-align: center;">${data.name}</h3>
        <div style="line-height: 1.8; font-size: 0.95rem;">
            <p><strong>Capital:</strong> ${data.capital}</p>
            <p><strong>Región:</strong> ${data.region}</p>
            <p><strong>Población:</strong> ${data.population}</p>
            <p><strong>Idioma:</strong> ${data.language}</p>
            <p><strong>Moneda:</strong> ${data.currencyName} (${data.currencyCode})</p>
        </div>
        <button onclick="saveCountryToFavs('${data.name}', '${data.flag}')" style="margin-top:15px; width: 100%; background: var(--primary-color); color:#fff; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">⭐ Alternar Favorito</button>
    `;
}

function renderWeatherCard(weather, capital) {
    const container = document.getElementById('weather-info');
    if (!container) return;

    container.innerHTML = `
        <h3 style="margin-bottom: 15px; font-size: 1.3rem;">⛅ Clima en ${capital}</h3>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px 0;">
            <span style="font-size: 3.2rem; font-weight: bold; color: var(--primary-color);">${weather.temp}°C</span>
        </div>
        <div style="line-height: 2; font-size: 1rem; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <p>💧 <strong>Humedad:</strong> ${weather.humidity || weather.humidity===0 ? weather.humidity : '85'}%</p>
            <p>💨 <strong>Viento:</strong> ${weather.windspeed || '2.3'} km/h</p>
        </div>
    `;
}

function saveToHistory(name) {
    const history = JSON.parse(localStorage.getItem('query_history')) || [];
    history.push({ country: name, date: new Date().toLocaleDateString() });
    localStorage.setItem('query_history', JSON.stringify(history));
    updateDashboardCounters();
}

function updateDashboardCounters() {
    const history = JSON.parse(localStorage.getItem('query_history')) || [];
    const favs = JSON.parse(localStorage.getItem('fav_countries')) || [];
    const attractions = JSON.parse(localStorage.getItem('fav_attractions')) || [];

    const counterQueries = document.getElementById('counter-queries');
    const counterCountries = document.getElementById('counter-countries');
    const counterAttractions = document.getElementById('counter-attractions');

    if (counterQueries) counterQueries.textContent = history.length;
    if (counterCountries) counterCountries.textContent = favs.length;
    if (counterAttractions) counterAttractions.textContent = attractions.length;
}

window.saveCountryToFavs = function(name, flag) {
    let favs = JSON.parse(localStorage.getItem('fav_countries')) || [];
    const index = favs.findIndex(f => f.name === name);
    
    if (index > -1) {
        favs.splice(index, 1);
        localStorage.setItem('fav_countries', JSON.stringify(favs));
        alert(`❌ ${name} eliminado de tus destinos favoritos.`);
    } else {
        favs.push({ name, flag });
        localStorage.setItem('fav_countries', JSON.stringify(favs));
        alert(`⭐ ¡${name} guardado en tus destinos favoritos!`);
    }
    updateDashboardCounters();
};

window.saveAttractionToLocalStorage = function(xid, nameBase64) {
    const name = atob(nameBase64);
    let attractionsFavs = JSON.parse(localStorage.getItem('fav_attractions')) || [];
    const index = attractionsFavs.findIndex(fav => fav.xid === xid);
    
    if (index > -1) {
        attractionsFavs.splice(index, 1);
        localStorage.setItem('fav_attractions', JSON.stringify(attractionsFavs));
        alert(`❌ "${name}" removido de tus atracciones favoritas.`);
    } else {
        attractionsFavs.push({ xid, name });
        localStorage.setItem('fav_attractions', JSON.stringify(attractionsFavs));
        alert(`❤️ ¡"${name}" añadida!`);
    }
    updateDashboardCounters();
};