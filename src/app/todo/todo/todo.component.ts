// src/app/todo/todo/todo.component.ts
import { Component, OnInit } from '@angular/core';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { GoogleSheetsService } from '../../core/services/google-sheets.service';
import { environment } from '../../../environments/environment';

declare const gapi: any;
declare const google: any;
interface SheetItem {
  id: string;
  name: string;
  createdTime: string;
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  standalone: false
})
export class TodoComponent implements OnInit {
  constructor(
    private auth: GoogleAuthService,
    private sheets: GoogleSheetsService
  ) {}

  sheetItems: SheetItem[] = [];
  pageToken: string | null = null;
  loading = false;
  showSignIn = true; // Set to true to show sign-in button


  async ngOnInit() {
    await this.auth.init();

    // (window as any).handleCredentialResponse = async () => {
    //   // You can ignore this for now, unless you're using ID token
    // };

    if (this.showSignIn) {
      google.accounts.id.initialize({
        client_id: environment.GOOGLE_CLIENT_ID,
        callback: () => {}, // we don't need ID token callback
      });


      // Inject a click handler
      setTimeout(() => {
        const button = document.querySelector("#google-signin-container > div") as HTMLElement;
        if (button) {
          button.onclick = async () => {
            await this.signInWithGoogle();
          };
        }
      }, 100); // Wait for DOM to render button
    }

  }


  async loadMoreSheets() {
    if (!this.auth.accessToken) {
      console.warn('Not authenticated. Please sign in.');
      return;
    }
    if (this.loading) return;
    this.loading = true;


    try {
      const response = await this.sheets.listSheetsByDate(this.pageToken);
      this.sheetItems.push(...response.files);
      this.pageToken = response.nextPageToken || null;
    } catch (err) {
      console.error('Error loading sheets:', err);
    } finally {
      this.loading = false;
    }
  }

  openSheet(sheetId: string) {
    this.sheets.openSheet(sheetId);
  }

  async signInWithGoogle() {
    try {

      await this.auth.requestAccessTokenAsync(); // invokes tokenClient popup
      this.showSignIn = false;
      await this.loadMoreSheets(); // if you want to load sheets post sign-in
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  }

  async createTodoSheet() {
    if (!this.auth.accessToken) {
      console.warn('Not authenticated. Please sign in.');
      return;
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const sheetTitle = `Todo - ${today.toISOString().slice(0, 10)}`;

    try {

      const existingSheetId = await this.sheets.findSheetByTitle(sheetTitle);
      if (existingSheetId) {
        this.sheets.openSheet(existingSheetId);
        return;
      }
      const sheetId = await this.sheets.createStyledTodoSheet(sheetTitle);
      const values = [['Example Task']];
      await this.sheets.populateSheet(sheetId, 'B2', values);
      this.sheets.openSheet(sheetId);
    } catch (err) {
      console.error('Sheet creation error:', err);
    }
  }

}
