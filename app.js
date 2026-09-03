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
  const available = Number(row['Qualification statuses']?.['Available to learners'] || 0);
  document.querySelector('.confidence small').textContent = `${available.toLocaleString()} available to learners · ${Number(row['Qualification count'] || 0).toLocaleString()} total records`;
  const facts = [
    ['Legal name', row['Legal Name']], ['Recognition number', row['Recognition Number']],
    ['Recognised from', String(row['Ofqual Recognised From'] || '').slice(0, 10)],
    ['Ofqual status', row['Ofqual Status']], ['CCEA status', row['CCEA Regulation Status']],
    ['Head office area', [row['Head Office Address Town/City'], row['Head Office Address Country']].filter(Boolean).join(', ')],
  ].filter(([, value]) => value);
  document.querySelector('#organisationFacts').innerHTML = facts.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('');
  const website = document.querySelector('#organisationWebsite');
  if (/^https?:\/\//.test(row.Website || '')) { website.href = row.Website; website.hidden = false; } else website.hidden = true;
  const summaries = [
    ['Status', row['Qualification statuses']], ['Level', row['Qualification levels']],
    ['Subject', row['Qualification subject areas']], ['Type', row['Qualification types']],
  ];
  document.querySelector('#qualificationSummary').innerHTML = summaries.flatMap(([kind, values]) => Object.entries(values || {}).slice(0, 5).map(([name, count]) => `<span><b>${esc(kind)}</b>${esc(name)} <strong>${Number(count).toLocaleString()}</strong></span>`)).join('');
  document.querySelector('#qualificationExamples').innerHTML = (row['Available qualification examples'] || []).map(item => `<article><strong>${esc(item.title)}</strong><span>${esc(item.number)} · ${esc(item.level || 'Level not published')}</span><small>${esc(item.subject || 'Subject not published')}</small>${/^https?:\/\//.test(item.specification || '') ? `<a href="${esc(item.specification)}" rel="external">Specification ↗</a>` : ''}</article>`).join('') || '<p>No currently available qualification example was included for this organisation.</p>';
  document.querySelector('#recordDetail').hidden = false;
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
