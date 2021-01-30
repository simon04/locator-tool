export class LoginToken {
  constructor(
    public access_token: string,
    public refresh_token: string,
    public access_token_expires_at: number
  ) {}

  static load(): LoginToken {
    return new LoginToken(
      localStorage.getItem('access_token'),
      localStorage.getItem('refresh_token'),
      +localStorage.getItem('access_token_expires_at')
    );
  }

  save(): this {
    localStorage.setItem('access_token', this.access_token);
    localStorage.setItem('refresh_token', this.refresh_token);
    +localStorage.setItem('access_token_expires_at', String(this.access_token_expires_at));
    return this;
  }

  static clear(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token_expires_at');
  }
}
