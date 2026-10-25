export function authErrorMessage(error) {
  const messages = {
    'auth/popup-closed-by-user': 'Die Anmeldung wurde abgebrochen. Du kannst es erneut versuchen.',
    'auth/cancelled-popup-request': 'Es ist bereits ein Anmeldefenster geöffnet.',
    'auth/popup-blocked': 'Bitte erlaube das Anmeldefenster. Öffne Athlet bei Bedarf direkt in Safari oder Chrome.',
    'auth/unauthorized-domain': 'Die Anmeldung ist für diese Website noch nicht freigeschaltet.',
    'auth/operation-not-allowed': 'Dieser Anmeldeanbieter ist noch nicht freigeschaltet.',
    'auth/network-request-failed': 'Die Anmeldung benötigt eine Internetverbindung. Bitte versuche es erneut.',
    'auth/account-exists-with-different-credential': 'Für diese E-Mail gibt es bereits einen anderen Anmeldeweg. Nutze bitte den ursprünglich gewählten Anbieter.',
    'auth/web-storage-unsupported': 'Dein Browser blockiert den benötigten Speicher. Bitte erlaube Website-Daten.',
    'auth/invalid-api-key': 'Die Anmeldung ist noch nicht vollständig eingerichtet.',
    'auth/not-configured': 'Die Kontoanmeldung wird noch eingerichtet. Du kannst Athlet bereits als Gast verwenden.',
    'auth/not-ready': 'Die Anmeldung wird geladen. Bitte versuche es gleich erneut.'
  };
  return messages[error?.code] || 'Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.';
}

export function createAuthController({config, loadSdk, emit}) {
  let sdk, auth, busy = false, ready = false, user = null;
  const configured = ['apiKey', 'authDomain', 'projectId', 'appId'].every(k => typeof config.firebase?.[k] === 'string' && config.firebase[k].trim());
  const providers = {google: config.providers?.google !== false, apple: config.providers?.apple !== false};
  const publish = (error = '') => emit({configured, ready, busy, providers, user, error});
  async function init() {
    publish();
    if (!configured) return;
    try {
      sdk = await loadSdk();
      const app = sdk.initializeApp(config.firebase, 'athlet-auth');
      auth = sdk.getAuth(app);
      auth.languageCode = 'de';
      await sdk.setPersistence(auth, sdk.browserLocalPersistence);
      // Firebase verifies and restores the session; never infer identity from localStorage.
      sdk.onAuthStateChanged(auth, next => {
        user = next ? {uid:next.uid, name:next.displayName || '', email:next.email || ''} : null;
        ready = true;
        publish();
      }, error => {ready = false;publish(authErrorMessage(error));});
    } catch (error) {
      ready = false;
      publish(authErrorMessage(error));
    }
  }
  async function login(provider) {
    if (!configured) {publish(authErrorMessage({code:'auth/not-configured'}));return;}
    if (!ready) {publish(authErrorMessage({code:'auth/not-ready'}));return;}
    if (busy) return;
    if (!['google','apple'].includes(provider) || !providers[provider]) {publish(authErrorMessage({code:'auth/operation-not-allowed'}));return;}
    busy = true;publish();
    try {
      const oauth = provider === 'google' ? new sdk.GoogleAuthProvider() : new sdk.OAuthProvider('apple.com');
      if (provider === 'google') oauth.setCustomParameters({prompt:'select_account'});
      else {oauth.addScope('email');oauth.addScope('name');oauth.setCustomParameters({locale:'de_DE'});}
      // Called directly from the click handler, with SDK already initialized.
      await sdk.signInWithPopup(auth, oauth);
    } catch (error) {busy = false;publish(authErrorMessage(error));return;}
    busy = false;publish();
  }
  async function logout() {
    if (!auth || busy) return;
    busy = true;publish();
    try {await sdk.signOut(auth);} catch (error) {busy = false;publish(authErrorMessage(error));return;}
    busy = false;publish();
  }
  return {init, login, logout};
}
