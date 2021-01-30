/**
 * RFC 7636: Proof Key for Code Exchange
 *
 * https://oauth.net/2/pkce/
 * https://tools.ietf.org/html/rfc7636
 */
export class PKCE {
  constructor(public state: string, public code_verifier: string) {}

  get code_challenge(): Promise<string> {
    return pkceChallengeFromVerifier(this.code_verifier);
  }

  get code_challenge_method(): string {
    return 'S256';
  }

  static generate(): PKCE {
    return new PKCE(generateRandomString(), generateRandomString());
  }

  static load(): PKCE {
    return new PKCE(localStorage.getItem('pkce_state'), localStorage.getItem('pkce_code_verifier'));
  }

  save(): this {
    localStorage.setItem('pkce_state', this.state);
    localStorage.setItem('pkce_code_verifier', this.code_verifier);
    return this;
  }

  static clear(): void {
    localStorage.removeItem('pkce_state');
    localStorage.removeItem('pkce_code_verifier');
  }
}

/**
 * Generate a secure random string using the browser crypto functions
 */
function generateRandomString(): string {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

/**
 * Calculate the SHA256 hash of the input text.
 * @returns a promise that resolves to an ArrayBuffer
 */
function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64-url-encodes the input string
 */
function base64urlencode(str: ArrayBuffer) {
  // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
  // btoa accepts chars only within ascii 0-255 and base64 encodes them.
  // Then convert the base64 encoded to base64url encoded
  //   (replace + with -, replace / with _, trim trailing =)
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Return the base64-urlencoded sha256 hash for the PKCE challenge
 */
async function pkceChallengeFromVerifier(v: string) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}
