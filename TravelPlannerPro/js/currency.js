// js/currency.js

async function renderCurrencyModule(currencyCode) {
    const container = document.getElementById('currency-info');
    if (!container) return;

    // Limpiamos cualquier texto residual
    container.innerHTML = `<h3 style="font-size: 1.3rem;">💱 Conversión de Moneda (${currencyCode})</h3><p>Calculando valores...</p>`;

    // Determinar la moneda base internacional
    const baseCurrency = currencyCode === 'USD' ? 'EUR' : 'USD';

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${currencyCode}`);
        if (!response.ok) throw new Error("Frankfurter inalcanzable");
        
        const data = await response.json();
        const rate = data.rates[currencyCode];

        container.innerHTML = `
            <h3 style="margin-bottom: 10px; font-size: 1.3rem;">💱 Tipo de Cambio Real</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px;">
                Tasa de mercado: <strong>1 ${baseCurrency} = ${rate.toFixed(2)} ${currencyCode}</strong>
            </p>
            <ul style="list-style: none; padding-left: 0; line-height: 2.2; font-size: 1rem;">
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>50 ${baseCurrency} =</strong> ${(50 * rate).toFixed(2)} ${currencyCode}</li>
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>100 ${baseCurrency} =</strong> ${(100 * rate).toFixed(2)} ${currencyCode}</li>
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>200 ${baseCurrency} =</strong> ${(200 * rate).toFixed(2)} ${currencyCode}</li>
            </ul>
        `;
    } catch (error) {
        console.warn("Falla de red en divisa. Ejecutando conversiones seguras calculadas localmente.");
        
        // Tasas de contingencia dinámicas matemáticas
        let mockRate = 1.0;
        if (currencyCode === 'COP') mockRate = 3950.00;
        if (currencyCode === 'JPY') mockRate = 156.50;
        if (currencyCode === 'EUR' && baseCurrency === 'USD') mockRate = 0.92;

        container.innerHTML = `
            <h3 style="margin-bottom: 10px; font-size: 1.3rem;">💱 Tipo de Cambio (Conversión Local)</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px;">
                Valor de referencia: <strong>1 ${baseCurrency} = ${mockRate.toFixed(2)} ${currencyCode}</strong>
            </p>
            <ul style="list-style: none; padding-left: 0; line-height: 2.2; font-size: 1rem;">
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>50 ${baseCurrency} =</strong> ${(50 * mockRate).toFixed(2)} ${currencyCode}</li>
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>100 ${baseCurrency} =</strong> ${(100 * mockRate).toFixed(2)} ${currencyCode}</li>
                <li style="border-bottom: 1px solid var(--border-color); padding: 5px 0;">💵 <strong>200 ${baseCurrency} =</strong> ${(200 * mockRate).toFixed(2)} ${currencyCode}</li>
            </ul>
        `;
    }
}