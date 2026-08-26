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
    .radar { display:block; width:min(100%,520px); margin:12px auto }.radar-grid polygon,.radar-grid line { fill:none; stroke:var(--line); stroke-width:1 }.radar-result { fill:rgba(25,95,70,.22); stroke:var(--accent); stroke-width:3 }.capability-legend { padding-left:20px }
    @media(max-width:600px){ main{margin-top:28px}.card{padding:18px} table{font-size:.9rem} }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
