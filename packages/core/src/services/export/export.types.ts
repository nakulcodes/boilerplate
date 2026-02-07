export interface ExportColumn<T = unknown> {
  key: keyof T | string;
  header: string;
  transform?: (value: unknown, row: T) => string;
}

export interface ExportOptions {
  sheetName?: string;
  dateFormat?: string;
}

export type ExportFormat = 'csv' | 'xlsx';
