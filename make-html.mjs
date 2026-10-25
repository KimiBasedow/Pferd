import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const base = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, base), 'utf8');
const [template, css, engine, app, authCore, authUi, icon] = await Promise.all([
  'dist/index.html', 'dist/style.css', 'dist/engine.js', 'dist/app.js',
  'dist/auth-core.mjs', 'dist/auth.js', 'dist/icon.svg'
].map(read));

// Bundle the local HTML variant without external files, a build tool, or a server.
const styles = css.replace(/@import url\([^)]*\);\s*/g, '');
const scriptTag = source => '<script>\n' + source.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const localApp = app
  .replace("if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});", '')
  .replace("$('#install-btn').onclick=showInstall;", "$('#install-btn').textContent='Über diese HTML-Version ↗';$('#install-btn').onclick=showInstall;");
const localAuth = [
  "const authConfig={firebase:null,providers:{google:true,apple:true}};",
  authCore.replace(/^export /gm, ''),
  authUi.replace(/^import .+;\s*$/gm, '')
].join('\n');
let html = template
  .replace(/<link rel="(?:manifest|apple-touch-icon)"[^>]*>/g, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}">`)
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + styles + '\n</style>')
  .replace(/<script[^>]*src="(?:engine|app|auth)\.js"[^>]*><\/script>/g, '')
  .replace(/<dialog id="install-dialog">[\s\S]*?<\/dialog>/, `<dialog id="install-dialog"><div class="dialog-head"><h2>Deine HTML-Version.</h2><button class="icon-button close-dialog" aria-label="Schließen">×</button></div><p>Diese Datei funktioniert direkt im Browser, auch ohne Internet. Wochenplanung, Ziele, Wettkämpfe und Trainingsmodus sind enthalten.</p><p class="form-note">Deine Trainingsdaten bleiben in diesem Browser. Nutze unter „Sport & Ausstattung“ die Datensicherung, um deinen Fortschritt zu übertragen.</p><p class="muted">Die Kontoanmeldung und eine Installation auf dem Startbildschirm benötigen die gehostete Web-App. Sprachansagen hängen von den auf deinem Gerät verfügbaren Stimmen ab.</p></dialog>`)
  .replace('</body>', () => scriptTag(engine) + '\n' + scriptTag(localApp) + '\n' + scriptTag('(function(){\n' + localAuth + '\n})();') + '\n</body>');

const destination = new URL('Athlet.html', base);
await writeFile(destination, html);
console.log(fileURLToPath(destination));
