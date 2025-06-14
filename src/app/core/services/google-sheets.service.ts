import { Injectable } from '@angular/core';
// src/app/core/services/google-sheets.service.ts

declare const gapi: any;


export class GoogleSheetsService {
  async createSheet(title: string): Promise<string> {
    const res = await gapi.client.sheets.spreadsheets.create({
      properties: { title }
    });
    return res.result.spreadsheetId;
  }

  async createStyledTodoSheet(title: string): Promise<string> {
    // 1. Create the spreadsheet
    const response = await gapi.client.sheets.spreadsheets.create({
      properties: { title }
    });

    const sheetId = response.result.spreadsheetId;
    const sheet = response.result.sheets[0];
    const sheetGid = sheet.properties.sheetId;

    // 2. Prepare update requests
    const requests = [
      // Set headers: A1 -> checkbox icon, B1 -> "Task"
      {
        updateCells: {
          start: { sheetId: sheetGid, rowIndex: 0, columnIndex: 0 },
          rows: [{
            values: [
              {
                userEnteredValue: { stringValue: '✓' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.9, blue: 0.8 },
                  textFormat: { bold: true }
                }
              },
              {
                userEnteredValue: { stringValue: 'Status' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.9, blue: 0.8 },
                  textFormat: { bold: true }
                }
              }
            ]
          }],
          fields: 'userEnteredValue,userEnteredFormat(backgroundColor,textFormat)'
        }
      },

      // Add checkboxes in A2:A30
      {
        repeatCell: {
          range: {
            sheetId: sheetGid,
            startRowIndex: 1,
            endRowIndex: 30,
            startColumnIndex: 0,
            endColumnIndex: 1
          },
          cell: {
            dataValidation: {
              condition: {
                type: 'BOOLEAN'
              },
              strict: true,
              showCustomUi: true
            },
            userEnteredValue: { boolValue: false }
          },
          fields: 'dataValidation,userEnteredValue'
        }
      },

      // Add conditional formatting: strike-through task if checkbox is checked
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{
              sheetId: sheetGid,
              startRowIndex: 1,
              endRowIndex: 30,
              startColumnIndex: 1,
              endColumnIndex: 2
            }],
            booleanRule: {
              condition: {
                type: 'CUSTOM_FORMULA',
                values: [{ userEnteredValue: '=A2=TRUE' }]
              },
              format: {
                textFormat: {
                  strikethrough: true,
                  foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 }
                }
              }
            }
          },
          index: 0
        }
      }
    ];

    // 3. Execute batch update
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requests
    });

    return sheetId;
  }



  populateSheet(sheetId: string, range: string, values: any[][]) {
    const body = { values };
    return gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: body,
    });
  }

  async listSheetsByDate(pageToken: string | null): Promise<{ files: any[], nextPageToken?: string }> {
    const response = await gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      orderBy: 'createdTime desc',
      fields: 'nextPageToken, files(id, name, createdTime)',
      pageSize: 2,
      pageToken: pageToken || undefined
    });
    return response.result;
  }

  async findSheetByTitle(title: string): Promise<string | null> {
    console.log(gapi.auth.getToken());

    const response = await gapi.client.drive.files.list({
      q: `name='${title}' and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name)'
    });

    const files = response.result?.files;
    if (files && files.length > 0) {
      return files[0].id;
    }
    return null;
  }

  openSheet(sheetId: string) {
    window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
  }
}