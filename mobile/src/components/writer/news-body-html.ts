export function newsBodyEditorHtml(initialHtml: string): string {
  const seed = JSON.stringify(initialHtml || '<p></p>');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html,body { margin:0; background:#050A14; color:#F8FAFC; font:15px/1.5 system-ui,sans-serif; }
  #bar { display:flex; flex-wrap:wrap; gap:4px; padding:8px; border-bottom:1px solid #334155; }
  #bar button { height:28px; padding:0 8px; font-size:12px; border-radius:6px; border:1px solid #334155; background:#0A1525; color:#F8FAFC; }
  #ed { min-height:220px; padding:12px; outline:none; }
  #ed img, #ed iframe { max-width:100%; border-radius:8px; }
  #ed iframe { width:100%; aspect-ratio:16/9; }
  #ed a { color:#93C5FD; }
  #ed h2,#ed h3 { margin:12px 0 8px; }
</style>
</head>
<body>
<div id="bar">
  <button type="button" data-cmd="bold">B</button>
  <button type="button" data-cmd="italic">I</button>
  <button type="button" data-cmd="underline">U</button>
  <button type="button" data-block="H2">H2</button>
  <button type="button" data-block="H3">H3</button>
  <button type="button" data-cmd="insertUnorderedList">•</button>
  <button type="button" data-cmd="insertOrderedList">1.</button>
  <button type="button" data-block="BLOCKQUOTE">❝</button>
  <button type="button" data-cmd="insertHorizontalRule">—</button>
  <button type="button" id="link">Link</button>
  <button type="button" id="img">Slika</button>
  <button type="button" id="yt">Video</button>
</div>
<div id="ed" contenteditable="true"></div>
<script>
  const ed = document.getElementById('ed');
  ed.innerHTML = ${seed};
  const send = () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'html', html: ed.innerHTML }));
  ed.addEventListener('input', send);
  document.getElementById('bar').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.cmd) document.execCommand(btn.dataset.cmd, false, null);
    if (btn.dataset.block) document.execCommand('formatBlock', false, btn.dataset.block);
    ed.focus();
    send();
  });
  document.getElementById('link').onclick = (e) => {
    e.stopPropagation();
    const url = prompt('URL:', 'https://');
    if (url) document.execCommand('createLink', false, url);
    send();
  };
  document.getElementById('img').onclick = (e) => {
    e.stopPropagation();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'image' }));
  };
  document.getElementById('yt').onclick = (e) => {
    e.stopPropagation();
    const url = prompt('YouTube URL:', 'https://www.youtube.com/watch?v=');
    if (!url) return;
    let id = '';
    try {
      const parsed = new URL(url);
      id = parsed.hostname.includes('youtu.be') ? parsed.pathname.replace('/', '') : (parsed.searchParams.get('v') || '');
    } catch (err) { id = ''; }
    if (!id) return;
    document.execCommand('insertHTML', false, '<iframe src="https://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>');
    send();
  };
  window.insertImage = (src) => {
    document.execCommand('insertHTML', false, '<img src="' + src.replace(/"/g, '') + '" />');
    send();
  };
</script>
</body>
</html>`;
}
