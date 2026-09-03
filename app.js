const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dataset;
const results = document.querySelector('#results');

function render(records, query = '') {
  results.innerHTML = records.slice(0, 24).map(row => `<button type="button" data-record="${esc(row['Recognition Number'])}"><b>${esc(row.Name)}</b><span>${esc(row.Acronym || row['Recognition Number'])} · ${Number(row['Qualification count'] || 0).toLocaleString()} qualifications</span><i>→</i></button>`).join('');
  document.querySelector('#resultSummary').textContent = `${records.length.toLocaleString()} organisation${records.length === 1 ? '' : 's'}${query ? ` matching “${query}”` : ' in the safe projection'}.`;
  results.querySelectorAll('[data-record]').forEach(button => button.addEventListener('click', () => show(records.find(row => row['Recognition Number'] === button.dataset.record))));
}

function show(row) {
  if (!row) return;
  document.querySelector('#answerLabel').textContent = row['Ofqual Status'] || 'Official record';
  document.querySelector('#answerTitle').innerHTML = `${esc(row.Name)} <span>${esc(row.Acronym || row['Recognition Number'])}</span>`;
  document.querySelector('#answerCopy').textContent = `Recognition number ${row['Recognition Number']}. The snapshot links this organisation to ${Number(row['Qualification count'] || 0).toLocaleString()} qualifications. This is qualification evidence, not permission for an individual to practise.`;
  document.querySelector('#answer').scrollIntoView({behavior:'smooth', block:'start'});
}

function search(raw) {
  const query = raw.trim().toLowerCase();
  const matched = dataset.records.filter(row => [row.Name, row['Legal Name'], row.Acronym, row['Recognition Number']].some(value => String(value || '').toLowerCase().includes(query)));
  render(matched, raw.trim());
  if (matched.length === 1) show(matched[0]); else document.querySelector('#browse').scrollIntoView({behavior:'smooth'});
}

fetch('/data/ofqual-organisations.json').then(response => response.json()).then(data => {
  dataset = data;
  document.querySelector('#generatedAt').dateTime = data.generatedAt;
  document.querySelector('#generatedAt').textContent = new Date(data.generatedAt).toLocaleString('en-GB', {dateStyle:'medium'});
  render(data.records);
}).catch(() => { document.querySelector('#resultSummary').textContent = 'The register projection is temporarily unavailable.'; });

document.querySelector('#searchForm').addEventListener('submit', event => { event.preventDefault(); search(document.querySelector('#query').value); });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { document.querySelector('#query').value = button.dataset.query; search(button.dataset.query); }));
document.querySelector('#copyLink').addEventListener('click', async event => { await navigator.clipboard?.writeText(location.href); event.currentTarget.textContent='Copied ✓'; });
document.querySelector('#shareBtn').addEventListener('click', async () => navigator.share ? navigator.share({title:document.title,url:location.href}) : navigator.clipboard?.writeText(location.href));
document.querySelector('#emailBtn').addEventListener('click', () => location.href='mailto:?subject=Can I Practice?&body='+encodeURIComponent(location.href));
