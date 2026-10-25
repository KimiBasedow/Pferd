import {authConfig} from './auth-config.js';
import {createAuthController} from './auth-core.mjs';

const dialog = document.querySelector('#account-dialog');
const status = document.querySelector('#auth-status');
const error = document.querySelector('#auth-error');
const buttons = [...document.querySelectorAll('[data-auth-provider]')];
let lastUid, lastUser = null;
const auth = createAuthController({
  config: authConfig,
  loadSdk: async () => {
    const [app, sdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
    ]);
    return {...app,...sdk};
  },
  emit: view => {
    document.querySelector('#auth-signin').hidden = !!view.user;
    document.querySelector('#auth-signed-in').hidden = !view.user;
    document.querySelector('#auth-user-name').textContent = view.user?.name || 'Dein Konto';
    document.querySelector('#auth-user-email').textContent = view.user?.email || '';
    document.querySelector('#account-button-label').textContent = view.user ? 'Mein Konto' : 'Anmelden';
    document.querySelector('#auth-logout').disabled = view.busy;
    for (const button of buttons) button.disabled = !view.configured || !view.ready || view.busy || !view.providers[button.dataset.authProvider];
    status.textContent = !view.configured ? 'Die Kontoanmeldung wird noch eingerichtet. Bis dahin kannst du als Gast trainieren.' : !view.ready ? 'Anmeldung wird geladen …' : view.busy ? 'Bitte schließe den Vorgang im Anmeldefenster ab.' : 'Wähle deinen bevorzugten Anmeldeweg.';
    error.textContent = view.error;
    lastUser = view.user;
    if (view.ready && lastUid !== (view.user?.uid || null)) {
      lastUid = view.user?.uid || null;
      window.dispatchEvent(new CustomEvent('athlet-auth-change', {detail:{user:view.user}}));
      if (view.user && dialog.open) dialog.close();
    }
    const mini = document.querySelector('.profile-mini strong');
    mini.textContent = view.user?.name || (view.user ? 'Dein Konto' : 'Dein Trainingsprofil');
  }
});

document.addEventListener('click', event => {
  if (event.target.closest('[data-account]')) dialog.showModal();
  const provider = event.target.closest('[data-auth-provider]');
  if (provider && !provider.disabled) auth.login(provider.dataset.authProvider);
});
document.querySelector('#auth-logout').addEventListener('click', () => auth.logout());
document.querySelector('#auth-guest').addEventListener('click', () => dialog.close());
window.addEventListener('athlet-profile-rendered', () => {
  const name = document.querySelector('#profile-account-name');
  if (name) name.textContent = lastUser?.name || lastUser?.email || 'Du nutzt Athlet als Gast.';
});
auth.init();
