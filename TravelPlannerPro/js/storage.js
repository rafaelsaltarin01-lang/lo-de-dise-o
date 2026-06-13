// js/storage.js

const StorageManager = {
    // Guardar los datos del perfil
    saveUser(user) {
        localStorage.setItem('tp_user', JSON.stringify(user));
    },
    getUser() {
        return JSON.parse(localStorage.getItem('tp_user'));
    },

    // Historial de consultas
    addQueryToHistory(countryName) {
        let history = JSON.parse(localStorage.getItem('tp_history')) || [];
        const newQuery = {
            country: countryName,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        history.unshift(newQuery); // Añade al inicio
        localStorage.setItem('tp_history', JSON.stringify(history));
    },
    getHistory() {
        return JSON.parse(localStorage.getItem('tp_history')) || [];
    },

    // Favoritos (Países y Atracciones)
    toggleFavoriteCountry(country) {
        let favs = JSON.parse(localStorage.getItem('tp_fav_countries')) || [];
        const index = favs.findIndex(f => f.name === country.name);
        
        if (index > -1) {
            favs.splice(index, 1); // Eliminar si ya existe
        } else {
            favs.push(country); // Añadir
        }
        localStorage.setItem('tp_fav_countries', JSON.stringify(favs));
        return favs;
    },
    getFavCountries() {
        return JSON.parse(localStorage.getItem('tp_fav_countries')) || [];
    },

    // Preferencia de Tema
    setTheme(theme) {
        localStorage.setItem('tp_theme', theme);
    },
    getTheme() {
        return localStorage.getItem('tp_theme') || 'light';
    }
};