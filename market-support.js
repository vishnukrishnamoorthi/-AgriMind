const marketTerms = async c => {
    const market = await api('/market/vegetables');
    const pricePanel = market.prices.available ? `<section class="panel price-panel"><div class="panel-heading"><div><span class="section-kicker">TODAY'S MARKET WATCH</span><h3>Tamil Nadu vegetable prices</h3></div><span class="market-status">${esc(market.prices.date || 'Today')}</span></div><p class="source-note">Source: <a href="${esc(market.prices.source_url)}" target="_blank" rel="noopener noreferrer">${esc(market.prices.source)}</a> · Live source reference</p><div class="price-table-wrap"><table class="table price-table"><thead><tr><th>Vegetable</th><th>Market price</th><th>Retail range</th><th>Unit</th></tr></thead><tbody>${market.prices.prices.map(item => `<tr><td><b>${esc(item.name)}</b></td><td class="price-value">${esc(item.price)}</td><td>${esc(item.retail_price)}</td><td>${esc(item.unit)}</td></tr>`).join('')}</tbody></table></div><div class="result-warning">${esc(market.prices.disclaimer)}</div></section>` : `<section class="panel price-panel unavailable-panel"><div class="panel-heading"><div><span class="section-kicker">TODAY'S MARKET WATCH</span><h3>Prices unavailable</h3></div><span class="market-status">Check later</span></div><p>${esc(market.prices.message)}</p><a class="text-link" href="${esc(market.prices.source_url)}" target="_blank" rel="noopener noreferrer">Open source market page</a></section>`;
    c.innerHTML = `<div class="dashboard-intro"><div><span class="eyebrow">FARMER SUPPORT</span><h3>Sell with more confidence</h3><p>Prepare your vegetable lot, agree the important details, and keep a simple record.</p></div><span class="market-status">Planning guide</span></div>${pricePanel}
        <div class="grid market-layout"><section class="panel"><div class="panel-heading"><div><span class="section-kicker">VEGETABLE LOTS</span><h3>Quality checklist</h3></div><span class="panel-meta">${market.vegetables.length} examples</span></div><div class="vegetable-list">${market.vegetables.map(item => `<div class="vegetable-row"><div class="vegetable-icon">${item.name.charAt(0)}</div><div><b>${esc(item.name)}</b><small>Sell by ${esc(item.unit)} · ${esc(item.quality)}</small></div></div>`).join('')}</div></section>
        <section class="panel support-panel"><div class="panel-heading"><div><span class="section-kicker">ADDITIONAL SUPPORT</span><h3>Before you sell</h3></div><span class="support-icon">?</span></div><div class="support-list"><div><b>1. Check the market</b><small>Compare at least two buyer or mandi quotes on the same day.</small></div><div><b>2. Prepare the lot</b><small>Sort, shade, pack, and photograph the produce before dispatch.</small></div><div><b>3. Keep evidence</b><small>Save the agreed price, weight, transport details, and payment receipt.</small></div><div><b>4. Ask for help</b><small>Use the AI assistant for planning, then confirm disputes or contracts with a local extension officer.</small></div></div></section></div>
        <section class="panel terms-panel"><div class="panel-heading"><div><span class="section-kicker">SALES TERMS</span><h3>Agree these details with the buyer</h3></div><span class="tag medium">Non-binding guide</span></div><div class="terms-grid">${market.terms.map(([title, detail]) => `<div class="term-card"><b>${esc(title)}</b><p>${esc(detail)}</p></div>`).join('')}</div><div class="result-warning">${esc(market.disclaimer)}</div></section>`;
};

const originalRender = render;
title.market = 'Market & support';
const marketButton = document.createElement('button');
marketButton.dataset.page = 'market';
marketButton.textContent = 'Market & support';
$('#nav').insertBefore(marketButton, $('#nav button[data-page="alerts"]'));
render = async function() {
    if (page === 'market') {
        showNotice('');
        $('#page-title').textContent = title.market;
        document.querySelectorAll('#nav button').forEach(button => button.classList.toggle('active', button.dataset.page === page));
        try { await marketTerms($('#content')); } catch (error) { $('#content').innerHTML = `<p class="error">${esc(error.message)}</p>`; }
        return;
    }
    return originalRender();
};
