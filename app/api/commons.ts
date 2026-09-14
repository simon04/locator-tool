// The Wikimedia Commons deployment to read from and write to.
// Override via `.env` files, e.g. `pnpm dev --mode beta` for the beta cluster.
export const COMMONS_URL = import.meta.env.VITE_COMMONS_URL || 'https://commons.wikimedia.org';

export const API_PHP_URL = `${COMMONS_URL}/w/api.php`;
export const REST_PHP_URL = `${COMMONS_URL}/w/rest.php`;

// Public (non-confidential) OAuth 2.0 client, registered for COMMONS_URL at
// https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
export const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || '';

// Must match the callback URL registered for the client. The authorization code
// is picked up wherever the app is served from, see handleAuthorizationCallback.
export const OAUTH_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${location.origin}/`;
