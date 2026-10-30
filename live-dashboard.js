let dashboardTimer;

function liveSignal(signal) {
    return `<div class="signal-row"><span class="tag ${signal.level}">${esc(signal.level)}</span><div><b>${esc(signal.label)}</b><small>${esc(signal.detail)}</small></div></div>`;
}

async function dashboard(c) {
    clearInterval(dashboardTimer);
    const refresh = async () => {
        const [overview, weatherData, alertsData, live] = await Promise.all([
            api('/analytics/overview'),
            api(await weatherPath()),
            api('/alerts'),
            api('/analytics/live-crop'),
        ]);
        const trend = overview.moisture_trend || [];
        const score = live.available ? live.health_score : null;
        const statusClass = score === null ? 'medium' : score >= 80 ? 'low' : score >= 55 ? 'medium' : 'high';
        c.innerHTML = `
            <div class="dashboard-intro">
                <div><span class="eyebrow">FIELD COMMAND CENTER</span><h3>Good morning, ${esc(user.name.split(' ')[0])}</h3><p>See what needs attention across your farm, updated from the latest sensor signal.</p></div>
                <button id="refresh-dashboard" class="secondary-button" type="button">Refresh now</button>
            </div>
            <div class="grid metrics">
                <div class="metric metric-accent"><span>FARMS MONITORED</span><strong>${overview.farm_count}</strong><small>Active farm records</small></div>
                <div class="metric"><span>LAND AREA</span><strong>${overview.total_acres}<em> ac</em></strong><small>Total registered acreage</small></div>
                <div class="metric ${overview.open_alerts ? 'metric-warning' : ''}"><span>OPEN ALERTS</span><strong>${overview.open_alerts}</strong><small>${overview.open_alerts ? 'Needs a review' : 'Nothing urgent'}</small></div>
                <div class="metric"><span>SOIL MOISTURE</span><strong>${overview.latest_reading?.soil_moisture ?? '—'}<em>%</em></strong><small>Latest reading</small></div>
            </div>
            <div class="grid live-layout">
                <section class="panel live-panel">
                    <div class="panel-heading"><div><span class="section-kicker">LIVE CROP ANALYSIS</span><h3>${live.available ? esc(live.farm_name) : 'Waiting for sensor data'}</h3></div><span class="live-dot">LIVE / 15s</span></div>
                    ${live.available ? `<div class="health-summary"><div class="score-ring ${statusClass}"><strong>${score}</strong><span>/100</span></div><div><span class="tag ${statusClass}">${esc(live.status)}</span><h4>${esc(live.crop)} field signal</h4><p>${esc(live.recommendation)}</p></div></div><div class="signal-list">${live.signals.length ? live.signals.map(liveSignal).join('') : '<div class="signal-clear">✓ No risk signals detected in the latest reading.</div>'}</div><small class="updated-at">Reading captured ${esc(new Date(live.reading.captured_at).toLocaleString())}</small>` : `<div class="empty-result">${esc(live.message)}</div>`}
                </section>
                <section class="panel weather-panel"><div class="panel-heading"><div><span class="section-kicker">LOCAL WEATHER</span><h3>${esc(weatherData.location)}</h3></div><span class="weather-icon">☀</span></div><div class="weather"><strong>${weatherData.current.temperature_2m ?? '—'}°</strong><div><b>${weatherData.current.relative_humidity_2m ?? '—'}% humidity</b><br><span>${weatherData.current.precipitation ?? 0} mm rain now</span></div></div><p>${weatherData.simulated ? 'Demo fallback is active.' : 'Live conditions from Open-Meteo.'}</p></section>
            </div>
            <div class="grid two lower-dashboard"><section class="panel"><div class="panel-heading"><div><span class="section-kicker">SENSOR TREND</span><h3>Moisture history</h3></div><span class="panel-meta">${trend.length} readings</span></div><div class="chart">${trend.map((x, i) => `<div class="bar" style="height:${Math.max(10, x.value * 2)}px"><small>${i + 1}</small></div>`).join('') || '<p>No sensor readings yet.</p>'}</div></section><section class="panel"><div class="panel-heading"><div><span class="section-kicker">ATTENTION</span><h3>Open alerts</h3></div><span class="panel-meta">${alertsData.length} open</span></div>${alertsData.length ? `<div class="alert-list">${alertsData.slice(0, 3).map(x => `<div class="alert-row"><span class="tag ${x.severity}">${esc(x.severity)}</span><div><b>${esc(x.title)}</b><small>${esc(x.message)}</small></div></div>`).join('')}</div>` : '<div class="signal-clear">✓ Your fields are clear.</div>'}</section></div>`;
        $('#refresh-dashboard').onclick = refresh;
    };
    try {
        await refresh();
        dashboardTimer = setInterval(() => {
            if (page === 'dashboard') refresh().catch(error => showNotice(error.message));
        }, 15000);
    } catch (error) {
        c.innerHTML = `<p class="error">${esc(error.message)}</p>`;
    }
}
