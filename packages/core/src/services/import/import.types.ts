export interface ImportColumn {
  key: string;
  header: string;
  required?: boolean;
  transform?: (value: string) => unknown;
  validate?: (value: unknown) => boolean | string;
}

export interface ImportError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export interface ImportResult<T> {
  data: T[];
  errors: ImportError[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ImportOptions {
  sheetName?: string;
  skipRows?: number;
}

export type ImportFormat = 'csv' | 'xlsx';
