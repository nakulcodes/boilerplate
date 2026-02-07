import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { format as formatCsv } from 'fast-csv';
import { Readable, PassThrough } from 'stream';
import { ExportColumn, ExportOptions } from './export.types';

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

function formatValue<T>(
  value: unknown,
  column: ExportColumn<T>,
  row: T,
): string {
  if (column.transform) {
    return column.transform(value, row);
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

@Injectable()
export abstract class ExportService {
  abstract toCSV<T>(data: T[], columns: ExportColumn<T>[]): Promise<Buffer>;

  abstract toExcel<T>(
    data: T[],
    columns: ExportColumn<T>[],
    options?: ExportOptions,
  ): Promise<Buffer>;

  abstract streamCSV<T>(
    data: AsyncIterable<T[]>,
    columns: ExportColumn<T>[],
  ): Readable;
}

@Injectable()
export class DefaultExportService extends ExportService {
  async toCSV<T>(data: T[], columns: ExportColumn<T>[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = formatCsv({ headers: columns.map((c) => c.header) });

      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      for (const row of data) {
        const rowData = columns.map((col) => {
          const value = getNestedValue(row, String(col.key));
          return formatValue(value, col, row);
        });
        stream.write(rowData);
      }
      stream.end();
    });
  }

  async toExcel<T>(
    data: T[],
    columns: ExportColumn<T>[],
    options?: ExportOptions,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options?.sheetName || 'Sheet1');

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: String(col.key),
      width: 20,
    }));

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    for (const row of data) {
      const rowData: Record<string, string> = {};
      for (const col of columns) {
        const value = getNestedValue(row, String(col.key));
        rowData[String(col.key)] = formatValue(value, col, row);
      }
      worksheet.addRow(rowData);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  streamCSV<T>(data: AsyncIterable<T[]>, columns: ExportColumn<T>[]): Readable {
    const passThrough = new PassThrough();
    const csvStream = formatCsv({ headers: columns.map((c) => c.header) });

    csvStream.pipe(passThrough);

    (async () => {
      try {
        for await (const batch of data) {
          for (const row of batch) {
            const rowData = columns.map((col) => {
              const value = getNestedValue(row, String(col.key));
              return formatValue(value, col, row);
            });
            csvStream.write(rowData);
          }
        }
        csvStream.end();
      } catch (error) {
        passThrough.destroy(error as Error);
      }
    })();

    return passThrough;
  }
}
