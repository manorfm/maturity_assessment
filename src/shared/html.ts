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
  <title>${escapeHtml(title)} · Maturity Assessment</title>
  <style>
    :root { color-scheme: light; --bg:#f4f5f2; --surface:#fff; --ink:#19221d; --muted:#637069; --line:#dce1dc; --accent:#195f46; --soft:#e8f1ec; }
    * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 system-ui,-apple-system,sans-serif }
    main { width:min(920px,calc(100% - 32px)); margin:48px auto 80px } header { margin-bottom:32px } h1 { font-size:clamp(2rem,5vw,3.4rem); line-height:1.05; letter-spacing:-.04em; margin:.25rem 0 1rem } h2 { margin-top:2rem } h3 { margin-bottom:.4rem }
    .eyebrow { color:var(--accent); font-weight:700; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem }.lead { color:var(--muted); font-size:1.12rem; max-width:70ch }
    .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:24px; margin:18px 0; box-shadow:0 8px 30px rgba(25,34,29,.04) }
    label { display:block; font-weight:650; margin:16px 0 6px } input,select,textarea { width:100%; padding:11px 12px; border:1px solid #b8c1bb; border-radius:8px; background:#fff; color:var(--ink); font:inherit } textarea { min-height:120px; resize:vertical }
    button,.button { display:inline-block; border:0; border-radius:8px; padding:11px 17px; background:var(--accent); color:#fff; font:inherit; font-weight:700; text-decoration:none; cursor:pointer; margin-top:16px }.button.secondary { background:var(--soft); color:var(--accent) }
    .choice { display:flex; gap:10px; align-items:flex-start; border:1px solid var(--line); border-radius:9px; padding:12px; margin:9px 0; font-weight:400 }.choice input { width:auto; margin-top:5px }
    .muted,small { color:var(--muted) }.notice { border-left:4px solid var(--accent); background:var(--soft); padding:13px 16px }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px }.metric { font-size:2rem; font-weight:750 }.tag { display:inline-block; background:var(--soft); color:var(--accent); padding:3px 9px; border-radius:999px; font-size:.82rem; margin:2px }
    code { overflow-wrap:anywhere } summary { cursor:pointer }
    .radar { display:block; width:min(100%,620px); margin:12px auto; overflow:visible }.radar-grid { pointer-events:none }.radar-grid polygon,.radar-grid line { fill:none; stroke:var(--line); stroke-width:1 }.radar-result { fill:rgba(25,95,70,.22); stroke:var(--accent); stroke-width:3; pointer-events:none }.radar-point circle { fill:var(--accent); stroke:#fff; stroke-width:3 }.radar-point text { fill:var(--ink); font-size:10px; text-anchor:middle }.radar-point:focus circle,.radar-point:hover circle { fill:#0f8a60; r:11px }.radar-detail { display:none; border-top:1px solid var(--line); padding-top:12px }.radar-detail:target,.radar-detail:has(:target) { display:block }.radar-detail h4 { font-size:1.2rem; margin-bottom:.25rem }.radar-detail h5 { font-size:1rem; margin-bottom:.2rem }
    .radar-unassessed text { fill:var(--muted); font-size:10px; font-style:italic; text-anchor:middle }.radar-unassessed tspan { font-size:9px }.radar-unassessed:hover text,.radar-unassessed:focus text { fill:var(--accent) }
    .classification { border:1px solid var(--line); border-left:5px solid var(--accent); border-radius:12px; padding:18px 20px; margin:18px 0; background:var(--surface) }.classification-level { font-size:1.8rem; font-weight:800 }
    .radar-drill-navigation { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:8px 0 20px }.radar-drill-link { border:1px solid var(--line); border-radius:999px; padding:7px 11px; color:var(--accent); text-decoration:none; font-weight:700 }.radar-drill-link span { background:var(--soft); border-radius:999px; padding:2px 6px; margin-left:4px }
    .capability-navigation { display:flex; align-items:center; gap:16px; margin:0 0 30px; padding:10px 14px; border:1px solid var(--line); border-radius:12px; background:rgba(255,255,255,.72); box-shadow:0 5px 20px rgba(25,34,29,.035) }.back-link { flex:0 0 auto; display:inline-flex; align-items:center; gap:7px; padding:7px 11px; border-radius:8px; background:var(--soft); color:var(--accent); font-weight:750; text-decoration:none }.back-link:hover,.back-link:focus-visible { background:#dcebe3; outline:2px solid transparent }.breadcrumb { display:flex; align-items:center; gap:8px; min-width:0; color:var(--muted); font-size:.9rem; overflow-x:auto; white-space:nowrap; scrollbar-width:thin }.breadcrumb a { color:var(--muted); text-decoration:none }.breadcrumb a:hover,.breadcrumb a:focus-visible { color:var(--accent); text-decoration:underline }.breadcrumb-separator { color:#9aa49e }.breadcrumb-current { color:var(--ink); font-weight:700 }
    .coverage { display:grid; grid-template-columns:auto minmax(120px,1fr); align-items:center; gap:12px; color:var(--muted); font-size:.9rem }.coverage-track { display:block; height:8px; overflow:hidden; border-radius:999px; background:var(--line) }.coverage-track span { display:block; height:100%; border-radius:inherit; background:var(--accent) }
    fieldset { border:0; padding:0; margin:24px 0 } legend { font-weight:750; font-size:1.15rem }.hierarchy-row { margin:10px 0 10px min(calc(var(--level) * 28px),45%); padding:12px; border:1px solid var(--line); border-radius:10px; background:var(--bg); display:grid; grid-template-columns:24px minmax(180px,1fr) auto; gap:10px; align-items:center }.hierarchy-branch { color:var(--accent); font-weight:800 }.hierarchy-actions { display:flex; gap:7px; flex-wrap:wrap }.hierarchy-actions button,.compact { margin:0; padding:8px 11px; font-size:.88rem }.button.danger { background:#f5e9e7; color:#8a3026 }.form-error { color:#9a2e22; min-height:1.5em; font-weight:650 }
    @media(max-width:600px){ main{margin-top:28px}.card{padding:18px} table{font-size:.9rem}.hierarchy-row{margin-left:min(calc(var(--level) * 14px),28%);grid-template-columns:18px 1fr}.hierarchy-actions{grid-column:2}.capability-navigation{align-items:flex-start;flex-direction:column;gap:10px}.breadcrumb{width:100%} }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
