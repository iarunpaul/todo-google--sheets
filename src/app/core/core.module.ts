import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleSheetsService } from './services/google-sheets.service';


@NgModule({
  imports: [CommonModule],
  providers: [GoogleAuthService, GoogleSheetsService],
})
export class CoreModule {}