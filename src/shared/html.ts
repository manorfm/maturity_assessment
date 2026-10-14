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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">
  <style>
    :root { color-scheme: light; --bg:#F6F2EA; --surface:#FFFDF8; --ink:#1E1C19; --muted:#625B51; --line:#DCD4C6; --accent:#0D5C63; --soft:#DCEAE8; --critical:#A2372A; --reactive:#94560F; --repeatable:#b78a00; --managed:#2563a8; --unknown:#B9B2A7; --serif:Newsreader,Georgia,"Times New Roman",serif; --sans:"IBM Plex Sans","Segoe UI",system-ui,sans-serif; }
    * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 var(--sans) }
    main { width:min(920px,calc(100% - 32px)); margin:48px auto 80px } body:has(.report-home) main, body:has(.manage-workspace) main, body:has(.admin) main, body:has(.interview) main, body:has(.diagnostic-report) main { width:100%; max-width:none; margin:0; padding:0 } body:has(.showcase-compare) main { width:min(1180px,calc(100% - 32px)) } body > main > header { margin-bottom:32px } body > main > header h1, .admin-heading h1 { font-size:clamp(2rem,5vw,3.4rem); line-height:1.05; letter-spacing:-.04em; margin:.25rem 0 1rem } h2 { margin-top:2rem } h3 { margin-bottom:.4rem }
    .manage-workspace { display:flex; flex-direction:column; min-height:100vh; background:var(--bg) }
    .manage-report { flex:none }
    .manage-report .diagnostic-report { min-height:0 }
    .manage-report .report-sidebar { position:sticky; top:0; max-height:100vh; overflow:auto }
    .manage-ops { border-top:1px solid var(--line); background:var(--bg) }
    .manage-ops .admin--embedded { min-height:0 }
    .manage-ops .admin--embedded .admin-body { min-height:0 }
    .manage-report .notice { margin:0; padding:16px clamp(20px,4vw,48px); border-bottom:1px solid var(--line); background:var(--soft); color:var(--ink); font-size:14px }
    .admin { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); color:var(--ink) }
    .admin-top { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:20px clamp(20px,4vw,48px); border-bottom:1px solid var(--rule,#DCD4C6); background:var(--surface) }
    .admin-brand { display:flex; gap:20px; align-items:baseline }
    .admin-brand strong { font-family:Newsreader,Georgia,serif; font-size:20px; font-weight:600 }
    .admin-brand span, .admin-top-meta { font-size:14px; color:var(--ink3,#625B51) }
    .admin-top-meta { display:flex; gap:16px; align-items:center; color:var(--ink2,#46413A) }
    .admin-status { display:inline-flex; align-items:center; padding:3px 9px; border-radius:999px; font-size:12px; font-weight:500; color:var(--accent-ink,#0A4B51); background:var(--accent-soft,#DCEAE8) }
    .admin-body { display:flex; flex:1; min-height:0 }
    .admin-steps { width:264px; flex:none; box-sizing:border-box; padding:36px 20px; border-right:1px solid var(--rule,#DCD4C6); display:flex; flex-direction:column; gap:4px }
    .admin-step { display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:8px; text-decoration:none; color:var(--ink2,#46413A); font-size:14px }
    .admin-step.current { background:var(--accent-soft,#DCEAE8); color:var(--accent-ink,#0A4B51); font-weight:600 }
    .admin-step-mark { flex:none; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; border:1.5px solid var(--ink3,#625B51); box-sizing:border-box }
    .admin-step.current .admin-step-mark { border:0; background:var(--accent); color:var(--on-accent,#fff) }
    .admin-main { flex:1; min-width:0; box-sizing:border-box; padding:44px clamp(20px,5vw,64px); display:flex; flex-direction:column; gap:32px }
    .admin--embedded .admin-steps { padding-top:28px }
    .admin--embedded .admin-main { padding-top:36px }
    .admin-heading { display:flex; flex-direction:column; gap:10px; max-width:760px }
    .admin-heading h2 { margin:0; font-family:Newsreader,Georgia,serif; font-size:clamp(28px,3vw,36px); line-height:1.15; font-weight:500; letter-spacing:-.01em }
    .admin-heading p { margin:0; font-size:16px; color:var(--ink2,#46413A); max-width:72ch }
    .admin-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px }
    .admin-metric { display:flex; flex-direction:column; gap:2px; padding:20px 24px; background:var(--surface); border:1px solid var(--rule,#DCD4C6); border-radius:10px }
    .admin-metric-label { font-size:13px; color:var(--ink3,#625B51) }
    .admin-metric-value { font-family:Newsreader,Georgia,serif; font-size:40px; line-height:1.1; font-weight:500 }
    .admin-metric-hint { font-size:13px; color:var(--ink2,#46413A) }
    .admin-panel { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:56px; align-items:start }
    .admin-aside { display:flex; flex-direction:column; gap:14px; padding:24px; background:var(--sunk,#EFE9DE); border-radius:10px; font-size:14px; color:var(--ink2,#46413A) }
    .admin-aside-title { font-weight:600; color:var(--ink) }
    .admin-aside p { margin:0 }
    .admin-form { display:flex; flex-direction:column; gap:22px }
    .admin-form label { margin:0; font-size:14px; font-weight:600 }
    .admin-form input, .admin-form select, .admin-form textarea { border:1.5px solid var(--rule,#DCD4C6); border-radius:8px; background:var(--surface); padding:11px 14px }
    .admin-form button, .admin-actions .button, .admin-actions button { min-height:46px; padding:0 26px; border-radius:8px; border:0; background:var(--accent); color:var(--on-accent,#fff); font-weight:600; margin-top:0 }
    .admin-form .button.secondary, .admin-actions .button.secondary { background:transparent; color:var(--ink); border:1px solid var(--rule,#DCD4C6); font-weight:500 }
    .admin-batches { display:grid; gap:12px }
    .admin-batch { padding:16px 18px; border:1px solid var(--rule,#DCD4C6); border-radius:10px; background:var(--surface) }
    .admin-terms { padding:32px 36px; background:var(--surface); border:1px solid var(--rule,#DCD4C6); border-radius:10px }
    .admin-terms-title { font-family:Newsreader,Georgia,serif; font-size:22px; font-weight:500; margin-bottom:8px }
    .admin-terms ol { list-style:none; margin:0; padding:0 }
    .admin-terms li { display:grid; grid-template-columns:40px minmax(0,1fr); gap:12px; padding:18px 0; border-top:1px solid var(--rule,#DCD4C6) }
    .admin-terms li > span { font-family:Newsreader,Georgia,serif; font-size:22px; color:var(--ink3,#625B51) }
    .admin-terms li p { margin:4px 0 0; color:var(--ink2,#46413A) }
    .admin .hierarchy-row { background:transparent; border:0; padding:6px 0; grid-template-columns:18px minmax(180px,1fr) auto }
    .admin .hierarchy-editor { border:1px solid var(--rule,#DCD4C6); border-radius:10px; padding:24px 28px; background:var(--surface); margin:0 }
    @media(max-width:980px){ .admin-body{flex-direction:column} .admin-steps{width:auto;border-right:0;border-bottom:1px solid var(--rule,#DCD4C6);flex-direction:row;flex-wrap:wrap;padding:16px} .admin-metrics,.admin-panel{grid-template-columns:1fr} .admin-main{padding:28px 16px 48px} }
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
    .area-map-systems { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin:12px 0 8px }
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
    .interview-report > .lead { margin:.2rem 0 1rem; max-width:68ch; color:var(--muted); font-size:1rem }
    .interview-chapter { margin:22px 0 8px }
    .interview-chapter > h2 { font-size:1.05rem; margin:0 0 10px; color:var(--muted); font-family:var(--sans); letter-spacing:.04em; text-transform:uppercase }
    .interview-problem { padding:18px 18px 16px; margin:0 0 14px; border:1px solid var(--line); border-left:4px solid var(--critical); border-radius:12px; background:var(--surface) }
    .interview-problem:last-child { border-bottom:1px solid var(--line) }
    .interview-problem > .muted:first-child { margin:0 0 4px }
    .interview-problem .executive-reading { font-size:1.22rem; line-height:1.35; margin:.1rem 0 .45rem; font-weight:650 }
    .interview-problem > p { color:var(--muted); font-size:.98rem }
    .interview-problem > p strong { color:var(--ink); font-weight:650 }
    .interview-solutions { display:grid; gap:12px; margin:14px 0 4px }
    .interview-solution { padding:14px 16px; border:1px solid var(--line); border-left:4px solid var(--accent); border-radius:10px; background:var(--soft) }
    .interview-solution.leading { border-color:var(--accent) }
    .interview-solution h4 { margin:.15rem 0 .4rem; font-family:var(--sans); font-size:.78rem; letter-spacing:.04em; text-transform:uppercase; color:var(--accent) }
    .support-band { font-family:var(--sans); color:var(--accent); font-weight:750; font-size:.72rem; letter-spacing:.04em; text-transform:uppercase }
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
    .discipline-recorte { max-width:68ch; margin:.2rem 0 1.2rem; color:var(--muted) }
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
    .showcase-deck h1 { font-size:clamp(1.8rem,4vw,2.6rem) }
    .showcase-deck .lead { max-width:62ch; color:var(--muted) }
    .showcase-howto,.showcase-poc { background:transparent; border:0; box-shadow:none; padding:0; margin:8px 0 28px }
    .showcase-howto h2,.showcase-cases h2,.showcase-poc h2 { margin:0 0 10px; font-size:1.05rem; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); font-weight:700 }
    .showcase-summary { color:var(--muted); max-width:68ch; margin:0 0 18px }
    .showcase-steps { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px }
    .showcase-steps li { display:flex; gap:10px; align-items:flex-start; padding:14px 16px; border:1px solid var(--line); border-radius:12px; background:var(--surface) }
    .showcase-steps span { flex:0 0 auto; width:1.6rem; height:1.6rem; border-radius:999px; background:var(--soft); color:var(--accent); font-weight:750; font-size:.85rem; display:grid; place-items:center }
    .showcase-steps p { margin:0; color:var(--muted); font-size:.92rem; line-height:1.45 }
    .showcase-compare { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; align-items:stretch }
    .showcase-simulation { display:flex; flex-direction:column; margin:0; padding:20px 20px 18px; border:1px solid var(--line); border-radius:16px; background:var(--surface); box-shadow:0 8px 30px rgba(25,34,29,.04) }
    .showcase-simulation[data-band="low"] { border-top:4px solid var(--critical) }
    .showcase-simulation[data-band="medium"] { border-top:4px solid var(--reactive) }
    .showcase-simulation[data-band="high"] { border-top:4px solid var(--accent) }
    .showcase-sim-head { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px }
    .showcase-simulation h3 { margin:.15rem 0 .45rem; font-size:1.2rem; line-height:1.25 }
    .showcase-desc { color:var(--muted); font-size:.92rem; line-height:1.45; margin:0 0 16px }
    .showcase-block { padding:12px 14px; border-radius:10px; margin:0 0 10px }
    .showcase-block.problem { background:color-mix(in srgb, var(--critical) 8%, var(--surface)); border:1px solid color-mix(in srgb, var(--critical) 22%, var(--line)) }
    .showcase-block.path { background:var(--soft); border:1px solid color-mix(in srgb, var(--accent) 22%, var(--line)) }
    .field-label { margin:0 0 4px; font-size:.7rem; font-weight:750; letter-spacing:.06em; text-transform:uppercase; color:var(--muted) }
    .showcase-block.problem .field-label { color:var(--critical) }
    .showcase-block.path .field-label { color:var(--accent) }
    .showcase-problem { margin:0 0 6px; font-weight:650; line-height:1.35 }
    .showcase-where { margin:0; color:var(--muted); font-size:.85rem }
    .showcase-block.path p { margin:0; font-size:.95rem; line-height:1.45 }
    .showcase-simulation .button { margin-top:auto; align-self:flex-start }
    .showcase-poc { color:var(--muted); max-width:68ch }
    .showcase-poc p { margin:.35rem 0 }
    .showcase-report { margin:18px 0 8px; padding-top:12px; border-top:1px solid var(--line) }
    article.card > .tag { margin-bottom:8px }
    details.methodology > article { margin:16px 0 }
    .interview { --bg:#F6F2EA; --surface:#FFFDF8; --sunk:#EFE9DE; --ink:#1E1C19; --ink2:#46413A; --ink3:#625B51; --rule:#DCD4C6; --accent:#0D5C63; --accent-ink:#0A4B51; --accent-soft:#DCEAE8; --on-accent:#FFFFFF; --red:#A2372A; --red-soft:#F6E3DE; --ochre:#94560F; --ochre-soft:#F5E6D0; --na:#B9B2A7; --na-ink:#5E584E; --focus:#0D5C63; min-height:100vh; box-sizing:border-box; display:flex; flex-direction:column; background:var(--bg); color:var(--ink); font-family:"IBM Plex Sans", sans-serif; font-size:16px; line-height:1.55 }
    .interview[data-theme="escuro"] { --bg:#171614; --surface:#211F1C; --sunk:#1B1A17; --ink:#EDE8DF; --ink2:#CBC3B6; --ink3:#A89F91; --rule:#3A3631; --accent:#5FB0B0; --accent-ink:#8FD0CF; --accent-soft:#1C3435; --on-accent:#0D1414; --red:#E8826F; --red-soft:#3C2420; --ochre:#E0A35C; --ochre-soft:#382B1A; --na:#6A645B; --na-ink:#B5AC9E; --focus:#8FD0CF; color-scheme:dark }
    .interview-header { display:flex; flex-direction:column; gap:12px; padding:20px clamp(20px,5vw,64px) 0 }
    .interview-progress-meta { display:flex; justify-content:space-between; align-items:center; gap:16px; font-size:13px; color:var(--ink3) }
    .interview-brand { font-family:Newsreader, Georgia, serif; font-size:17px; font-weight:600; color:var(--ink) }
    .interview-progress { height:4px; background:var(--rule); border-radius:2px; overflow:hidden }
    .interview-progress > div { height:4px; background:var(--accent) }
    .interview-main { flex:1; width:100%; max-width:1180px; margin:0 auto; box-sizing:border-box; padding:clamp(28px,6vw,72px) clamp(20px,5vw,64px) 32px; display:flex; flex-wrap:wrap; align-content:flex-start; gap:28px clamp(28px,6vw,80px) }
    .interview-copy { flex:1 1 320px; min-width:0; display:flex; flex-direction:column; gap:18px }
    .interview-kicker { margin:0; font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:var(--ink3) }
    .interview-copy h1 { margin:0; font-family:Newsreader, Georgia, serif; font-size:clamp(26px,3.2vw,40px); line-height:1.14; font-weight:500; letter-spacing:-.01em }
    .interview-lead { margin:0; font-size:15px; color:var(--ink2); max-width:46ch }
    .interview-panel { flex:1.25 1 320px; min-width:0; display:flex; flex-direction:column; gap:14px }
    .interview-form fieldset { border:0; margin:0; padding:0; min-width:0; display:flex; flex-direction:column; gap:10px }
    .interview-form legend { padding:0; margin:0 0 12px; font-size:clamp(17px,1.6vw,20px); font-weight:600; line-height:1.4 }
    .interview-choices { display:flex; flex-direction:column; gap:8px }
    .interview-choices-secondary { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:8px }
    .interview-or { display:flex; align-items:center; gap:10px; margin-top:4px; font-size:12px; color:var(--ink3) }
    .interview-or span:first-child, .interview-or span:last-child { flex:1; height:1px; background:var(--rule) }
    .interview-choice { position:relative; display:flex; align-items:center; gap:12px; width:100%; min-height:52px; box-sizing:border-box; margin:0; padding:12px 14px; border:1.5px solid var(--rule); background:var(--surface); border-radius:10px; text-align:left; cursor:pointer; font-size:15px; font-weight:400; line-height:1.35; color:var(--ink) }
    .interview-choice input { position:absolute; opacity:0; width:1px; height:1px; pointer-events:none }
    .interview-choice-dot { flex:none; width:18px; height:18px; border-radius:50%; border:2px solid var(--ink2); box-sizing:border-box; display:flex; align-items:center; justify-content:center }
    .interview-choice-dot > span { width:8px; height:8px; border-radius:50%; background:transparent }
    .interview-choice:has(:checked) { border-color:var(--accent); background:var(--accent-soft) }
    .interview-choice:has(:checked) .interview-choice-dot > span { background:var(--accent) }
    .interview-choice:focus-within { outline:3px solid var(--focus); outline-offset:2px }
    .interview-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px }
    .interview-actions button { flex:1 1 160px; max-width:320px; margin:0 0 0 auto; min-height:48px; padding:0 20px; border:0; border-radius:10px; background:var(--accent); color:var(--on-accent); font:inherit; font-weight:600; cursor:pointer }
    .interview-notice { margin:0; padding:14px 16px; border:1px solid var(--accent); border-radius:10px; background:var(--accent-soft); color:var(--ink); font-size:15px }
    .interview-hint { margin:0; color:var(--ink3); font-size:13px; max-width:60ch }
    .diagnostic-report { --bg:#F6F2EA; --surface:#FFFDF8; --ink:#1E1C19; --ink2:#46413A; --ink3:#625B51; --rule:#DCD4C6; --accent:#0D5C63; --accent-soft:#DCEAE8; --accent-ink:#0A4B51; --sunk:#EFE9DE; --ochre:#94560F; --red:#A2372A; --red-soft:#F6E3DE; --na:#B9B2A7; --na-ink:#5E584E; display:flex; align-items:stretch; min-height:100vh; background:var(--bg); color:var(--ink); font-family:"IBM Plex Sans", sans-serif; font-size:15px; line-height:1.5 }
    .diagnostic-report[data-theme="escuro"] { --bg:#171614; --surface:#211F1C; --ink:#EDE8DF; --ink2:#CBC3B6; --ink3:#A89F91; --rule:#3A3631; --accent:#5FB0B0; --accent-soft:#1C3435; --accent-ink:#8FD0CF; --sunk:#1B1A17; --ochre:#E0A35C; --red:#E8826F; --red-soft:#3C2420; --na:#6A645B; --na-ink:#B5AC9E; color-scheme:dark }
    .report-sidebar { width:248px; flex:none; box-sizing:border-box; padding:40px 20px; border-right:1px solid var(--rule); background:var(--sunk); display:flex; flex-direction:column; gap:28px }
    .report-brand { display:flex; flex-direction:column; gap:4px; padding:0 12px }
    .report-brand strong { font-family:Newsreader, Georgia, serif; font-size:20px; font-weight:600; line-height:1.2 }
    .report-brand span, .report-sidebar-note { color:var(--ink3); font-size:13px }
    .report-sidebar nav { display:flex; flex-direction:column; gap:2px }
    .report-sidebar a { display:block; padding:8px 12px; border-radius:6px; color:var(--ink2); text-decoration:none; font-size:14px }
    .report-sidebar a[aria-current="page"] { background:var(--accent-soft); color:var(--accent-ink); font-weight:600 }
    .report-sidebar-note { margin-top:auto; padding:0 12px; font-size:12px; line-height:1.5 }
    .report-theme { margin:0 12px; background:transparent; color:var(--accent-ink); border:1px solid var(--rule); border-radius:6px; padding:8px 12px; cursor:pointer }
    .report-main { flex:1; min-width:0; padding:48px clamp(24px,5vw,72px) 80px; display:flex; flex-direction:column; align-items:stretch }
    .report-hero { max-width:40rem; margin:0 0 8px }
    .report-hero h1, .report-block h2 { font-family:Newsreader, Georgia, serif; font-weight:500 }
    .report-hero h1 { font-size:clamp(2rem,4vw,2.75rem); line-height:1.12; letter-spacing:-.02em; margin:8px 0 12px }
    .report-kicker { font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:var(--ink3); margin:0 }
    .report-note, .report-gap { color:var(--ink2); margin:0; max-width:42rem }
    .report-block { display:grid; grid-template-columns:200px minmax(0,1fr); gap:8px 40px; border-top:1px solid var(--rule); padding-top:28px; margin-top:28px; max-width:52rem }
    .report-block h2 { grid-column:1; grid-row:1; margin:0; font-size:15px; font-weight:600 }
    .report-block > :not(h2) { grid-column:2 }
    .report-consistency { max-width:52rem; margin-top:28px; padding-top:28px; border-top:1px solid var(--rule) }
    .report-consistency .card { margin:0; box-shadow:none; background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:16px 20px }
    .report-finding { margin:0 0 16px; background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:22px; display:flex; flex-direction:column; gap:14px }
    .report-finding-path { display:flex; justify-content:space-between; align-items:center; gap:12px; font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:var(--ink3) }
    .report-finding-path span:last-child { font-family:Newsreader, Georgia, serif; font-size:15px; letter-spacing:0; text-transform:none; font-weight:600 }
    .report-finding-fact { margin:0; font-family:Newsreader, Georgia, serif; font-size:21px; line-height:1.3; font-weight:500; text-wrap:pretty; min-height:110px }
    .report-finding-meta { margin:0; display:flex; flex-direction:column; gap:6px; font-size:13px; color:var(--ink2) }
    .report-support { display:inline-flex; align-items:center; gap:8px }
    .report-support span { display:inline-flex; gap:3px }
    .report-support i { width:8px; height:8px; border-radius:50%; background:var(--ink2) }
    .report-finding a { font-size:14px; font-weight:600 }
    .report-quote { margin:0; padding:0 0 0 16px; border-left:3px solid var(--rule) }
    .report-quote p { margin:0; font-family:Newsreader, Georgia, serif; font-size:21px; line-height:1.3; font-weight:500 }
    .report-quote footer { margin-top:8px; color:var(--ink3); font-size:13px }
    .report-divergence-sides { display:grid; grid-template-columns:1fr 1fr; gap:16px }
    .report-conduct { margin:0 0 16px }
    .report-conduct h3 { margin:.15rem 0 .4rem; font-size:1.05rem }
    .report-index { font-family:Newsreader, Georgia, serif; font-size:40px; line-height:1; margin:0 }
    .report-footer { margin-top:48px; padding-top:20px; border-top:1px solid var(--rule); color:var(--ink3); font-size:13px; max-width:52rem }
    .report-tabs { display:flex; gap:4px; padding:4px; background:var(--sunk); border-radius:10px; width:max-content; margin:24px 0 }
    .report-tabs a { min-height:44px; padding:0 20px; border-radius:8px; display:inline-flex; align-items:center; text-decoration:none; color:var(--ink2) }
    .report-tabs a[aria-selected="true"] { background:var(--surface); color:var(--ink); font-weight:600 }
    .report-matrix-block { display:flex; flex-direction:column; gap:14px }
    .report-matrix-legend { display:flex; flex-direction:column; gap:8px; max-width:64ch; color:var(--ink2); font-size:15px }
    .report-matrix-legend p { margin:0 }
    .coverage-swatch { display:inline-block; width:22px; height:12px; margin-right:6px; border-radius:3px; border:1px solid var(--na); background:repeating-linear-gradient(45deg, var(--na) 0 2px, transparent 2px 6px); vertical-align:-1px }
    .report-matrix { width:100%; border-collapse:separate; border-spacing:0 }
    .report-matrix th, .report-matrix td { padding:8px 4px; text-align:center; font-size:12px; color:var(--ink2); font-weight:600 }
    .report-matrix th[scope="row"] { text-align:left; width:170px; font-size:14px }
    .coverage-gap { background:repeating-linear-gradient(45deg, var(--na) 0 2px, transparent 2px 6px); color:var(--na-ink); border:1px solid var(--na) }
    .index-gap { color:var(--ink3); font-weight:500 }
    .divergence-cell { text-align:left; font-weight:500; color:var(--ink2); border:1px solid var(--accent); background:var(--accent-soft) }
    .divergence-cell p { margin:0 }
    .readiness { padding:2px 10px; border-radius:999px; font-weight:700; font-size:12px }
    .readiness.ready { color:var(--accent-ink); background:var(--accent-soft) }
    .readiness.near { color:var(--ink); background:#F5E6D0 }
    .readiness.blocked { color:var(--red); background:var(--red-soft) }
    .diagnostic-report[data-theme="escuro"] .readiness.near { background:#382B1A }
    @media(max-width:980px){ .showcase-compare,.showcase-steps{grid-template-columns:1fr} .diagnostic-report{flex-direction:column} .report-sidebar{width:auto; position:static; max-height:none} .manage-report .report-sidebar{position:static; max-height:none} .report-block{grid-template-columns:1fr; gap:12px} .report-hero h1{font-size:1.85rem} .report-main{padding:24px 16px 48px} .report-divergence-sides{grid-template-columns:1fr} .area-map-systems{grid-template-columns:1fr} .admin-metrics{grid-template-columns:repeat(2,minmax(0,1fr))} .admin-panel{grid-template-columns:1fr; gap:24px} .admin-body{flex-direction:column} .admin-steps{width:auto; border-right:0; border-bottom:1px solid var(--rule,#DCD4C6); flex-direction:row; flex-wrap:wrap; padding:16px} }
    @media(max-width:700px){ main{margin-top:28px}.card{padding:18px} table{font-size:.9rem}.hierarchy-row{margin-left:min(calc(var(--level) * 14px),28%);grid-template-columns:18px 1fr}.hierarchy-actions{grid-column:2}.capability-navigation{align-items:flex-start;flex-direction:column;gap:10px}.breadcrumb{width:100%}.executive-facts,.executive-action-grid,.decision-grid,.radar-drill-navigation,.observation-grid{grid-template-columns:1fr}.radar-axis-label{font-size:8.5px}.area-map-systems{grid-template-columns:1fr} }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
