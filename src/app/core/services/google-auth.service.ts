import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const gapi: any;
declare const google: any;


export class GoogleAuthService {
  private CLIENT_ID = environment.GOOGLE_CLIENT_ID;
  private SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';
  private tokenClient: any;
  public accessToken: string | null = null;
  private accessTokenExpiresAt: number | null = null;

  async init(): Promise<void> {
    await this.loadGapi();
    await new Promise<void>(resolve => {
      gapi.load('client', async () => {
        await gapi.client.init({
          discoveryDocs: [ 'https://sheets.googleapis.com/$discovery/rest?version=v4',
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });
        resolve();
      });
    });

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (resp: any) => {
        this.setAccessToken(resp.access_token, resp.expires_in);
      }
    });
  }

  // obsolete, use requestAccessTokenAsync instead
  requestAccessToken() {
    this.tokenClient.requestAccessToken();
  }

  async requestAccessTokenAsync(): Promise<string | null> {
    if (!this.tokenClient) {
      await this.init(); // fallback if dev forgets to call init()
    }
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          console.error('Error requesting access token:', resp.error);
          reject(resp.error);
        } else {
          this.setAccessToken(resp.access_token, resp.expires_in);
          resolve(this.accessToken);
        }
      };
      this.tokenClient.requestAccessToken();
    });
  }

  isTokenExpired(): boolean {
    return !this.accessToken || !this.accessTokenExpiresAt || Date.now() > this.accessTokenExpiresAt;
  }

  private setAccessToken(token: string, expiresIn: number) {
    this.accessToken = token;
    this.accessTokenExpiresAt = Date.now() + expiresIn * 1000; // Convert to ms
    gapi.client.setToken({ access_token: this.accessToken });
  }

  private loadGapi(): Promise<void> {
    return new Promise(resolve => {
      (function check() {
        if (typeof gapi !== 'undefined') resolve();
        else setTimeout(check, 100);
      })();
    });
  }
}