const escapeMap: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (character) => escapeMap[character] ?? character);

export const layout = (title: string, content: string): string => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHtml(title)} · Diagnóstico de engenharia</title>
  <style>
    :root { color-scheme: light; --bg:#f3f1eb; --surface:#fffcf7; --ink:#1c1914; --muted:#5c584f; --line:#d8d2c6; --accent:#1d4f3e; --soft:#e7efe8; --critical:#b42318; --reactive:#d97706; --repeatable:#b78a00; --managed:#2563a8; --unknown:#7b8580; --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif; --sans:"Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif; }
    * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 var(--sans) }
    main { width:min(920px,calc(100% - 32px)); margin:48px auto 80px } body:has(.report-home) main { width:min(780px,calc(100% - 40px)); margin:36px auto 72px } header { margin-bottom:32px } h1 { font-size:clamp(2rem,5vw,3.4rem); line-height:1.05; letter-spacing:-.04em; margin:.25rem 0 1rem } h2 { margin-top:2rem } h3 { margin-bottom:.4rem }
    .eyebrow { color:var(--accent); font-weight:700; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem }.lead { color:var(--muted); font-size:1.12rem; max-width:70ch }
    .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:24px; margin:18px 0; box-shadow:0 8px 30px rgba(25,34,29,.04) }
    label { display:block; font-weight:650; margin:16px 0 6px } input,select,textarea { width:100%; padding:11px 12px; border:1px solid #b8c1bb; border-radius:8px; background:#fff; color:var(--ink); font:inherit } textarea { min-height:120px; resize:vertical }
    button,.button { display:inline-block; border:0; border-radius:8px; padding:11px 17px; background:var(--accent); color:#fff; font:inherit; font-weight:700; text-decoration:none; cursor:pointer; margin-top:16px }.button.secondary { background:var(--soft); color:var(--accent) }
    .choice { display:flex; gap:10px; align-items:flex-start; border:1px solid var(--line); border-radius:9px; padding:12px; margin:9px 0; font-weight:400 }.choice input { width:auto; margin-top:5px }
    .muted,small { color:var(--muted) }.notice { border-left:4px solid var(--accent); background:var(--soft); padding:13px 16px }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px }.metric { font-size:2rem; font-weight:750 }.tag { display:inline-block; background:var(--soft); color:var(--accent); padding:3px 9px; border-radius:999px; font-size:.82rem; margin:2px }
    code { overflow-wrap:anywhere } summary { cursor:pointer } .comparison-table { overflow-x:auto; margin:16px 0 } table { width:100%; border-collapse:collapse } th,td { padding:10px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top } thead th { color:var(--muted); font-size:.78rem; text-transform:uppercase; letter-spacing:.04em }
    .radar { display:block; width:min(100%,620px); margin:20px auto; overflow:visible }.radar-grid { pointer-events:none }.radar-grid polygon,.radar-grid line { fill:none; stroke:var(--line); stroke-width:1 }.radar-result { fill:rgba(25,95,70,.16); stroke:var(--accent); stroke-width:3; pointer-events:none }.radar-point circle { fill:var(--accent); stroke:#fff; stroke-width:3 }.radar-point.radar-status-critical circle { fill:var(--critical) }.radar-point.radar-status-reactive circle { fill:var(--reactive) }.radar-point.radar-status-repeatable circle { fill:var(--repeatable) }.radar-point.radar-status-managed circle { fill:var(--managed) }.radar-axis-label { fill:var(--ink); font-size:10px; text-anchor:middle }.radar-point:focus-visible { outline:none }.radar-point:focus circle,.radar-point:hover circle,.radar-marker:focus circle,.radar-marker:hover circle { stroke:var(--ink); stroke-width:3; r:11px }.radar-marker-unassessed circle { fill:var(--surface); stroke:var(--unknown); stroke-width:2 }.radar-question { fill:var(--unknown); font-size:12px; font-weight:800; text-anchor:middle }.radar-axis-unassessed { fill:var(--unknown); font-style:italic }.radar-axis-unassessed tspan { font-size:9px }.radar-tooltip { opacity:0; pointer-events:none; transition:opacity .12s ease }.radar-tooltip rect { fill:#17201b; stroke:#fff; stroke-width:1; filter:drop-shadow(0 4px 7px rgba(0,0,0,.2)) }.radar-tooltip text { fill:#fff; font-size:8px; text-anchor:middle; font-style:normal }.radar-tooltip .tooltip-title { font-weight:750 }.radar-point:hover .radar-tooltip,.radar-point:focus .radar-tooltip,.radar-marker:hover .radar-tooltip,.radar-marker:focus .radar-tooltip { opacity:1 }.radar-detail { display:none; border-top:1px solid var(--line); padding-top:12px }.radar-detail:target,.radar-detail:has(:target) { display:block }
    .classification { border:1px solid var(--line); border-left:5px solid var(--accent); border-radius:14px; padding:22px 24px; margin:18px 0; background:linear-gradient(135deg,var(--surface),#f8fbf9) }.classification-level { font-size:1.8rem; font-weight:800 }.consistency-detail .classification-level { font-size:1.2rem }.executive-summary .executive-reading { max-width:70ch; font-size:1.08rem }.executive-facts { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:20px 0 }.executive-facts div { background:rgba(255,255,255,.8); border:1px solid var(--line); border-radius:10px; padding:12px }.executive-facts dt { color:var(--muted); font-size:.78rem; font-weight:750; letter-spacing:.04em; text-transform:uppercase }.executive-facts dd { margin:5px 0 0; font-weight:650 }.methodology { margin-top:14px; border-top:1px solid var(--line); padding-top:12px; color:var(--muted) }.methodology summary { color:var(--accent); font-weight:700 }.methodology[open] summary { margin-bottom:10px }
    .outcome-card h3 { margin-top:1.35rem }.radar-labels { pointer-events:none }.radar-drill-navigation { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin:16px 0 0 }.radar-drill-link { display:flex; justify-content:space-between; align-items:baseline; gap:8px; border:1px solid var(--line); border-radius:10px; padding:9px 12px; color:var(--accent); text-decoration:none; font-weight:700; background:var(--soft) }.radar-drill-link span { color:var(--muted); font-weight:650; font-size:.85rem }.radar-drill-link.disabled { color:var(--unknown); background:#eef0ee; cursor:not-allowed }.radar-drill-link.disabled span { color:var(--unknown) }
    .audience-navigation { margin-bottom:30px }.audience-navigation h2 { margin-top:.25rem }.audience-link { display:block; min-height:150px; padding:16px; border:1px solid var(--line); border-radius:12px; background:var(--bg); color:var(--ink); text-decoration:none }.audience-link h3 { margin:.1rem 0 .45rem; color:var(--accent) }.audience-link p { margin:0 0 12px }.audience-link span { color:var(--accent); font-weight:750 }.audience-link:hover,.audience-link:focus-visible { border-color:var(--accent); box-shadow:0 6px 18px rgba(25,95,70,.09); outline:2px solid transparent }.audience-link.disabled { color:var(--muted) }.audience-link.disabled span { color:var(--muted) }.decision-evidence { margin:12px 0; padding:11px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line) }.decision-evidence+.decision-evidence { border-top:0; margin-top:-12px }.decision-evidence summary { color:var(--accent); font-weight:750 }.decision-evidence[open] summary { margin-bottom:10px }.outcome-card .decision-request { margin-top:24px }
    .diagnostic-group { margin:28px 0 }.diagnostic-group>h3 { border-bottom:1px solid var(--line); padding-bottom:8px }.diagnostic-problem .tag { font-weight:700 }.executive-action-grid,.decision-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin:18px 0 }.executive-action-grid>div,.decision-grid>div { padding:14px; border-radius:10px; background:var(--bg) }.executive-action-grid h4,.decision-grid h3 { margin:0 0 6px; color:var(--accent) }.executive-action-grid p,.decision-grid p { margin:0 }.decision-request { border:2px solid var(--accent); border-radius:12px; padding:16px 18px; margin:20px 0; background:var(--soft) }.decision-request p { margin:.35rem 0 }.perspective-synthesis h4 { margin-bottom:.35rem }.diagnostic-experiment { display:grid; grid-template-columns:max-content 1fr; gap:5px 12px; padding:12px 0 }.diagnostic-experiment dt { color:var(--muted); font-weight:700 }.diagnostic-experiment dd { margin:0 }
    .capability-navigation { display:flex; align-items:center; gap:16px; margin:0 0 30px; padding:10px 14px; border:1px solid var(--line); border-radius:12px; background:rgba(255,255,255,.72); box-shadow:0 5px 20px rgba(25,34,29,.035) }.back-link { flex:0 0 auto; display:inline-flex; align-items:center; gap:7px; padding:7px 11px; border-radius:8px; background:var(--soft); color:var(--accent); font-weight:750; text-decoration:none }.back-link:hover,.back-link:focus-visible { background:#dcebe3; outline:2px solid transparent }.breadcrumb { display:flex; align-items:center; gap:8px; min-width:0; color:var(--muted); font-size:.9rem; overflow-x:auto; white-space:nowrap; scrollbar-width:thin }.breadcrumb a { color:var(--muted); text-decoration:none }.breadcrumb a:hover,.breadcrumb a:focus-visible { color:var(--accent); text-decoration:underline }.breadcrumb-separator { color:#9aa49e }.breadcrumb-current { color:var(--ink); font-weight:700 }
    .coverage { display:grid; grid-template-columns:auto minmax(120px,1fr); align-items:center; gap:12px; color:var(--muted); font-size:.9rem }.coverage-track { display:block; height:8px; overflow:hidden; border-radius:999px; background:var(--line) }.coverage-track span { display:block; height:100%; border-radius:inherit; background:var(--accent) }
    fieldset { border:0; padding:0; margin:24px 0 } legend { font-weight:750; font-size:1.15rem }.hierarchy-row { margin:10px 0 10px min(calc(var(--level) * 28px),45%); padding:12px; border:1px solid var(--line); border-radius:10px; background:var(--bg); display:grid; grid-template-columns:24px minmax(180px,1fr) auto; gap:10px; align-items:center }.hierarchy-branch { color:var(--accent); font-weight:800 }.hierarchy-actions { display:flex; gap:7px; flex-wrap:wrap }.hierarchy-actions button,.compact { margin:0; padding:8px 11px; font-size:.88rem }.button.danger { background:#f5e9e7; color:#8a3026 }.form-error { color:#9a2e22; min-height:1.5em; font-weight:650 }
    .area-map-systems { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin:12px 0 8px }
    .area-tile { background:var(--soft); border:1px solid var(--line); border-radius:14px; padding:20px }
    .area-tile.unobserved { color:var(--muted) }
    .area-tile.observed { border-color:var(--accent) }
    .area-tile h3 { margin:.1rem 0 .35rem }
    .area-tile a { color:inherit; text-decoration:none }
    .area-chips { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 0 }
    .area-chip { border:1px solid var(--line); border-radius:999px; padding:4px 10px; color:var(--accent); text-decoration:none; font-size:.85rem; font-weight:650 }
    .area-band { margin:4px 0 0; padding:14px 0 0; border-top:1px solid var(--line) }
    .area-band a { color:var(--accent); font-weight:650; text-decoration:none }
    .area-index { display:grid; gap:10px; margin:18px 0 }
    .area-index-link { display:flex; justify-content:space-between; gap:12px; padding:16px 18px; border:1px solid var(--line); border-radius:12px; background:var(--surface); color:var(--ink); text-decoration:none }
    .area-index-link span { color:var(--muted) }
    .report-home { font-family:var(--serif); font-size:1.05rem; line-height:1.6 }
    .report-home header { margin-bottom:12px }
    .report-home h1 { font-family:var(--serif); font-size:clamp(1.7rem,3vw,2.2rem); font-weight:650; letter-spacing:-.02em; margin:.15rem 0 .4rem }
    .report-home .eyebrow { font-family:var(--sans); letter-spacing:.04em; font-size:.72rem }
    .report-home .card { box-shadow:none; border-radius:10px; padding:22px 24px; margin:14px 0 }
    .report-home .card > h2 { margin-top:0; font-size:1.15rem; font-weight:650 }
    .report-home .tag,.report-home a,.report-home .muted,.report-home summary,.report-home .area-chip,.report-home .area-drill { font-family:var(--sans) }
    .report-sample { font-family:var(--sans); color:var(--muted); font-size:.88rem; margin:0 0 22px }
    .report-systems { margin:28px 0 8px; padding-top:8px; border-top:1px solid var(--line) }
    .report-systems h2 { margin:0 0 12px; font-size:1.05rem; font-weight:650 }
    .report-home .area-tile { background:var(--surface); padding:16px 16px 14px; border-radius:10px }
    .report-home .area-tile h3 { font-family:var(--sans); font-size:1rem; margin:0 0 .25rem }
    .report-home .area-band { font-family:var(--sans); font-size:.9rem }
    .report-home .first-screen-systems h2,.report-home .finding-index h2,.report-home .scope-index h2,.report-home .front-inventory h2,.report-home .interview-report h2 { margin-top:0 }
    .interview-report { margin:0 0 28px }
    .interview-report > .lead { margin:.2rem 0 1rem; max-width:68ch }
    .interview-chapter { margin:22px 0 8px }
    .interview-chapter > h2 { font-size:1.2rem; margin:0 0 4px }
    .interview-problem { padding:18px 0 16px; border-bottom:1px solid var(--line) }
    .interview-problem:last-child { border-bottom:0 }
    .interview-problem .executive-reading { font-size:1.18rem; line-height:1.4; margin:.15rem 0 .55rem; font-weight:650 }
    .interview-solutions { display:grid; gap:12px; margin:12px 0 }
    .interview-solution { padding:14px 16px; border:1px solid var(--line); border-radius:10px; background:var(--surface) }
    .interview-solution.leading { border-color:var(--accent) }
    .interview-solution h4 { margin:.15rem 0 .4rem; font-family:var(--sans); font-size:.92rem }
    .support-band { font-family:var(--sans); color:var(--accent); font-weight:750; font-size:.78rem; letter-spacing:.03em; text-transform:uppercase }
    .discipline-reach { margin:22px 0; padding:0 }
    .discipline-reach h2 { margin:0 0 6px; font-size:1.15rem }
    .discipline-reach > p { color:var(--muted); margin:0 0 10px }
    .discipline-reach ul { list-style:none; padding:0; margin:0; display:grid; gap:8px }
    .discipline-reach li { padding:10px 0; border-bottom:1px solid var(--line) }
    .discipline-reach li:last-child { border-bottom:0 }
    .front-inventory-row { background:var(--bg); border:1px solid var(--line); border-radius:12px; padding:16px }
    .front-inventory-row h3 { margin:.1rem 0 .4rem }
    .outcome-card.compact { padding:4px 0 8px; margin:0 0 8px; border:0; background:transparent; box-shadow:none }
    .outcome-card.compact > .eyebrow { margin-bottom:4px }
    .outcome-card.compact h3 { margin-top:.7rem; font-family:var(--sans); font-size:.78rem; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); font-weight:700 }
    .outcome-card.compact section { margin:0 }
    .outcome-card.compact .decision-request { margin:14px 0; padding:14px 16px; border-radius:10px }
    .outcome-card.compact [data-narrative="experiment"] p { margin:.3rem 0 }
    .outcome-card.compact .notice { padding:8px 12px; margin:6px 0 0 }
    .outcome-card.compact .executive-reading { font-size:clamp(1.25rem,2.4vw,1.55rem); line-height:1.35; margin:.2rem 0 .5rem; font-weight:650 }
    .outcome-card.compact .methodology { font-family:var(--sans); font-size:.92rem }
    .finding-index,.scope-index { margin:18px 0 }
    .finding-index ul,.scope-index ul { list-style:none; padding:0; margin:0 }
    .finding-index li,.scope-line { display:flex; flex-wrap:wrap; gap:6px 10px; align-items:baseline; padding:12px 0; border-bottom:1px solid var(--line) }
    .scope-line:last-child { border-bottom:0 }
    .admin-footer { margin-top:28px }
    .finding-index > p { max-width:68ch }
    .discipline-brief { max-width:68ch; font-size:1.05rem; line-height:1.5; margin:.35rem 0 1.1rem }
    .discipline-scope { max-width:68ch; margin:.2rem 0 1.4rem; padding:16px 18px; border:1px solid var(--line); border-radius:12px; background:var(--soft) }
    .discipline-scope h2 { margin:.1rem 0 .45rem; font-size:1.15rem }
    .discipline-scope h3 { margin:.85rem 0 .25rem; font-size:.98rem; color:var(--accent) }
    .discipline-scope p { margin:0 }
    .area-chapter { margin:0 0 22px }
    .area-observes { max-width:68ch; margin:0 0 1.1rem }
    .area-chapter-problem { padding:16px 0; border-bottom:1px solid var(--line) }
    .area-chapter-problem:last-child { border-bottom:0 }
    .area-chapter-problem .executive-reading { font-size:1.15rem; line-height:1.4; margin:.15rem 0 .5rem; font-weight:650 }
    .discipline-level { margin:22px 0 }
    .discipline-level h2 { margin:0 0 10px }
    .problem-tree { display:grid; gap:18px; margin-top:12px }
    .problem-level { padding:12px 0 4px }
    .problem-depth-1 { margin-left:8px; padding-left:14px; border-left:2px solid var(--line) }
    .problem-depth-2 { margin-left:8px; padding-left:14px; border-left:2px solid var(--line) }
    .problem-fever { max-width:68ch; color:var(--muted) }
    .observation-group { margin:18px 0 0; padding-top:16px; border-top:1px solid var(--line) }
    .observation-group:first-of-type { border-top:0; padding-top:4px }
    .observation-group h3 { margin:0 0 8px; font-size:1rem }
    .observation-grid { display:grid; gap:10px; margin:8px 0 0; grid-template-columns:repeat(2,minmax(0,1fr)) }
    .observation-card:last-child:nth-child(odd) { grid-column:1 / -1 }
    .observation-card { padding:14px 16px; border:1px solid var(--line); border-radius:12px; background:var(--soft) }
    .observation-card p { margin:.35rem 0 0 }
    .audience-brief-card { padding:16px 18px; border:1px solid var(--line); border-radius:12px; background:var(--bg); margin:12px 0 }
    .audience-brief-card h3 { margin:.1rem 0 .5rem }
    .audience-brief-card a { color:var(--accent); font-weight:650 }
    .area-drill { color:var(--accent); font-weight:750; text-decoration:none }
    .scope-line a { color:var(--accent); font-weight:650 }
    .showcase-deck { margin-bottom:8px }
    .showcase-deck .lead { max-width:68ch }
    article.card > .tag { margin-bottom:8px }
    details.methodology > article { margin:16px 0 }
    @media(max-width:700px){ main{margin-top:28px}.card{padding:18px} table{font-size:.9rem}.hierarchy-row{margin-left:min(calc(var(--level) * 14px),28%);grid-template-columns:18px 1fr}.hierarchy-actions{grid-column:2}.capability-navigation{align-items:flex-start;flex-direction:column;gap:10px}.breadcrumb{width:100%}.executive-facts,.executive-action-grid,.decision-grid,.radar-drill-navigation,.observation-grid{grid-template-columns:1fr}.radar-axis-label{font-size:8.5px}.area-map-systems{grid-template-columns:1fr} }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
