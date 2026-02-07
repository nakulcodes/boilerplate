import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { parse } from 'fast-csv';
import { Readable } from 'stream';
import {
  ImportColumn,
  ImportError,
  ImportResult,
  ImportOptions,
} from './import.types';

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, ' ');
}

function validateAndTransformRow<T>(
  row: Record<string, string>,
  columns: ImportColumn[],
  rowNumber: number,
  headerMap: Map<string, string>,
): { data: Partial<T> | null; errors: ImportError[] } {
  const errors: ImportError[] = [];
  const data: Record<string, unknown> = {};

  for (const column of columns) {
    const csvHeader = headerMap.get(normalizeHeader(column.header));
    const rawValue = csvHeader ? row[csvHeader] : undefined;
    const trimmedValue =
      typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (
      column.required &&
      (trimmedValue === undefined || trimmedValue === '')
    ) {
      errors.push({
        row: rowNumber,
        column: column.header,
        value: rawValue,
        message: `${column.header} is required`,
      });
      continue;
    }

    if (trimmedValue === undefined || trimmedValue === '') {
      data[column.key] = null;
      continue;
    }

    let value: unknown = trimmedValue;
    if (column.transform) {
      try {
        value = column.transform(trimmedValue as string);
      } catch {
        errors.push({
          row: rowNumber,
          column: column.header,
          value: rawValue,
          message: `Failed to transform ${column.header}`,
        });
        continue;
      }
    }

    if (column.validate) {
      const validationResult = column.validate(value);
      if (validationResult !== true) {
        errors.push({
          row: rowNumber,
          column: column.header,
          value: rawValue,
          message:
            typeof validationResult === 'string'
              ? validationResult
              : `Invalid value for ${column.header}`,
        });
        continue;
      }
    }

    data[column.key] = value;
  }

  return {
    data: errors.length === 0 ? (data as Partial<T>) : null,
    errors,
  };
}

@Injectable()
export abstract class ImportService {
  abstract parseCSV<T>(
    buffer: Buffer,
    columns: ImportColumn[],
  ): Promise<ImportResult<T>>;

  abstract parseExcel<T>(
    buffer: Buffer,
    columns: ImportColumn[],
    options?: ImportOptions,
  ): Promise<ImportResult<T>>;
}

@Injectable()
export class DefaultImportService extends ImportService {
  async parseCSV<T>(
    buffer: Buffer,
    columns: ImportColumn[],
  ): Promise<ImportResult<T>> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const errors: ImportError[] = [];
      let rowNumber = 0;
      let headerMap: Map<string, string> = new Map();

      const stream = Readable.from(buffer);
      const parser = parse({ headers: true, trim: true });

      parser.on('headers', (headers: string[]) => {
        headerMap = new Map(headers.map((h) => [normalizeHeader(h), h]));
      });

      parser.on('data', (row: Record<string, string>) => {
        rowNumber++;
        const { data, errors: rowErrors } = validateAndTransformRow<T>(
          row,
          columns,
          rowNumber,
          headerMap,
        );

        if (data) {
          results.push(data as T);
        }
        errors.push(...rowErrors);
      });

      parser.on('end', () => {
        resolve({
          data: results,
          errors,
          totalRows: rowNumber,
          validRows: results.length,
          invalidRows: rowNumber - results.length,
        });
      });

      parser.on('error', reject);

      stream.pipe(parser);
    });
  }

  async parseExcel<T>(
    buffer: Buffer,
    columns: ImportColumn[],
    options?: ImportOptions,
  ): Promise<ImportResult<T>> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const worksheet = options?.sheetName
      ? workbook.getWorksheet(options.sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      return {
        data: [],
        errors: [
          { row: 0, column: '', value: '', message: 'No worksheet found' },
        ],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
      };
    }

    const results: T[] = [];
    const errors: ImportError[] = [];

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value || '');
    });

    const excelHeaderMap = new Map(headers.map((h) => [normalizeHeader(h), h]));

    const skipRows = options?.skipRows || 0;
    const startRow = 2 + skipRows;

    for (
      let rowNumber = startRow;
      rowNumber <= worksheet.rowCount;
      rowNumber++
    ) {
      const row = worksheet.getRow(rowNumber);
      const rowData: Record<string, string> = {};

      let hasAnyValue = false;
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          const value = cell.value;
          rowData[header] =
            value === null || value === undefined ? '' : String(value);
          if (rowData[header]) hasAnyValue = true;
        }
      });

      if (!hasAnyValue) continue;

      const { data, errors: rowErrors } = validateAndTransformRow<T>(
        rowData,
        columns,
        rowNumber - 1,
        excelHeaderMap,
      );

      if (data) {
        results.push(data as T);
      }
      errors.push(...rowErrors);
    }

    const totalRows = worksheet.rowCount - 1 - skipRows;
    return {
      data: results,
      errors,
      totalRows: Math.max(0, totalRows),
      validRows: results.length,
      invalidRows: Math.max(0, totalRows - results.length),
    };
  }
}
