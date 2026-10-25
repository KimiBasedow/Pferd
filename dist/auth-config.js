// Public Firebase web configuration, NOT service-account keys or Apple private keys.
// See AUTH_SETUP.md. Until configured, Athlet continues to work as a guest.
export const authConfig = {
  firebase: null,
  providers: { google: true, apple: true }
};
