// js/weather.js
async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        if (!response.ok) throw new Error('Error al consultar el clima');
        
        const data = await response.json();
        
        return {
            temp: data.current.temperature_2m,
            // Asegúrate de que apunte a relative_humidity_2m:
            humidity: data.current.relative_humidity_2m, 
            windspeed: data.current.wind_speed_10m
        };
    } catch (error) {
        console.error("Error en Clima API:", error);
        return null;
    }
}